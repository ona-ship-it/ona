-- Function to check and close expired giveaways
CREATE OR REPLACE FUNCTION check_expired_giveaways()
RETURNS void AS $$
BEGIN
  -- Update expired giveaways to 'ended' status
  UPDATE giveaways
  SET status = 'ended'
  WHERE status = 'active'
  AND end_date < NOW()
  AND winner_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check and close sold out raffles
CREATE OR REPLACE FUNCTION check_sold_out_raffles()
RETURNS void AS $$
BEGIN
  -- Update sold out raffles
  UPDATE raffles
  SET status = 'sold_out'
  WHERE status = 'active'
  AND tickets_sold >= total_tickets
  AND winner_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to select random giveaway winner
CREATE OR REPLACE FUNCTION draw_giveaway_winner(giveaway_uuid UUID)
RETURNS UUID AS $$
DECLARE
  winner_ticket_id UUID;
  winner_user_id UUID;
  total_entries INTEGER;
BEGIN
  -- Count total entries
  SELECT COUNT(*) INTO total_entries
  FROM tickets
  WHERE giveaway_id = giveaway_uuid;
  
  IF total_entries = 0 THEN
    RAISE EXCEPTION 'No entries for this giveaway';
  END IF;
  
  -- Select random winner using cryptographic randomness
  SELECT id, user_id INTO winner_ticket_id, winner_user_id
  FROM tickets
  WHERE giveaway_id = giveaway_uuid
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- Update ticket as winner
  UPDATE tickets
  SET is_winner = TRUE
  WHERE id = winner_ticket_id;
  
  -- Update giveaway with winner
  UPDATE giveaways
  SET 
    winner_id = winner_user_id,
    winner_drawn_at = NOW(),
    status = 'completed'
  WHERE id = giveaway_uuid;
  
  RETURN winner_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to select random raffle winner
CREATE OR REPLACE FUNCTION draw_raffle_winner(raffle_uuid UUID)
RETURNS UUID AS $$
DECLARE
  winner_user_id UUID;
  winner_ticket_id UUID;
  total_tickets_count INTEGER;
  winning_number INTEGER;
BEGIN
  -- Get total tickets
  SELECT total_tickets INTO total_tickets_count
  FROM raffles
  WHERE id = raffle_uuid;
  
  IF total_tickets_count = 0 THEN
    RAISE EXCEPTION 'No tickets for this raffle';
  END IF;
  
  -- Generate random winning number
  winning_number := FLOOR(RANDOM() * total_tickets_count) + 1;
  
  -- Find the ticket holder of the winning number
  SELECT rt.id, rt.user_id INTO winner_ticket_id, winner_user_id
  FROM raffle_tickets rt
  WHERE rt.raffle_id = raffle_uuid
  AND winning_number = ANY(rt.ticket_numbers)
  LIMIT 1;
  
  IF winner_user_id IS NULL THEN
    RAISE EXCEPTION 'No ticket holder found for winning number';
  END IF;
  
  -- Mark ticket as winner
  UPDATE raffle_tickets
  SET is_winner = TRUE, winner_place = 1
  WHERE id = winner_ticket_id;
  
  -- Update raffle with winner
  UPDATE raffles
  SET 
    winner_id = winner_user_id,
    winner_drawn_at = NOW(),
    status = 'completed'
  WHERE id = raffle_uuid;
  
  RETURN winner_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create a log table for winner notifications
CREATE TABLE IF NOT EXISTS winner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID REFERENCES giveaways(id),
  raffle_id UUID REFERENCES raffles(id),
  winner_id UUID REFERENCES auth.users(id) NOT NULL,
  notification_type TEXT NOT NULL, -- 'email', 'sms', 'push'
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_winner_notifications_winner ON winner_notifications(winner_id);
CREATE INDEX idx_winner_notifications_status ON winner_notifications(status);

-- Enable RLS
ALTER TABLE winner_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" 
  ON winner_notifications FOR SELECT 
  USING (auth.uid() = winner_id);
