import React from 'react';
import Navigation from '@/components/Navigation';
import PageTitle from '@/components/PageTitle';

export default function Contact() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mt-10 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white border-opacity-20 max-w-4xl mx-auto">
          <PageTitle title="Contact Us" className="text-white text-center" />
          
          <p className="text-white text-xl mb-8 text-center">
            Have questions or feedback? We'd love to hear from you!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-lg shadow-lg">
              <h3 className="text-white font-bold text-xl mb-4">Get in Touch</h3>
              <ul className="text-white space-y-3">
                <li className="flex items-center">
                  <span className="mr-2">📧</span>
                  <span>Email: support@onagui.com</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🌐</span>
                  <span>Discord: discord.gg/onagui</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🐦</span>
                  <span>Twitter: @onagui_official</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-lg shadow-lg">
              <h3 className="text-white font-bold text-xl mb-4">Office Hours</h3>
              <p className="text-white mb-2">Monday - Friday: 9am - 6pm EST</p>
              <p className="text-white mb-2">Saturday: 10am - 2pm EST</p>
              <p className="text-white">Sunday: Closed</p>
              <p className="text-white mt-4">Response time: Within 24 hours</p>
            </div>
          </div>
          
          <form className="bg-white bg-opacity-5 p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white mb-2">Name</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-white mb-2">Email</label>
                <input type="email" className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white" placeholder="Your email" />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-white mb-2">Subject</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white" placeholder="Subject" />
            </div>
            
            <div className="mb-6">
              <label className="block text-white mb-2">Message</label>
              <textarea rows={4} className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white" placeholder="Your message"></textarea>
            </div>
            
            <div className="flex justify-center">
              <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}