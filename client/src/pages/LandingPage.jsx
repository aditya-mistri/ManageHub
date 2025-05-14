import { useState, useEffect } from 'react';
import { ArrowRightIcon, ChartBarIcon, ShieldCheckIcon, EnvelopeIcon, UsersIcon, CogIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const features = [
    {
      title: "Customer Management",
      description: "Efficiently organize and track all customer interactions in one centralized platform.",
      icon: <UsersIcon className="w-8 h-8 text-indigo-400" />
    },
    {
      title: "Campaign Automation",
      description: "Create targeted campaigns with our intuitive rule builder and track performance metrics.",
      icon: <EnvelopeIcon className="w-8 h-8 text-indigo-400" />
    },
    {
      title: "Order Processing",
      description: "Streamline your order workflow with real-time updates and notifications.",
      icon: <ChartBarIcon className="w-8 h-8 text-indigo-400" />
    },
    {
      title: "Secure Access",
      description: "Role-based access control with Google OAuth for enterprise-grade security.",
      icon: <ShieldCheckIcon className="w-8 h-8 text-indigo-400" />
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CogIcon className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              CRM-DASH-PRO
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-indigo-400 transition">Features</a>
            <a href="#technology" className="hover:text-indigo-400 transition">Technology</a>
            <a href="#demo" className="hover:text-indigo-400 transition">Demo</a>
          </div>
          <a 
            href="/login" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium transition"
          >
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Modern <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">CRM</span> for 
            <br />Your Business Growth
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Streamline customer relationships, automate campaigns, and gain insights with our powerful CRM platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/login" 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium transition"
            >
              Get Started
            </a>
            <a 
              href="#demo" 
              className="px-6 py-3 border border-gray-700 hover:border-indigo-400 rounded-md font-medium transition"
            >
              Live Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Designed to help you manage customers, orders, and campaigns with ease
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`p-6 rounded-lg cursor-pointer transition ${currentFeature === index ? 'bg-gray-700 border-l-4 border-indigo-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-md bg-gray-700">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 w-full max-w-md h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 mx-auto w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    {features[currentFeature].icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{features[currentFeature].title}</h3>
                  <p className="text-gray-400">{features[currentFeature].description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built With Modern Technology</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Leveraging the best tools for performance, scalability, and security
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { name: "MongoDB", color: "text-green-500" },
              { name: "Express", color: "text-gray-400" },
              { name: "React", color: "text-blue-400" },
              { name: "Node.js", color: "text-green-400" },
              { name: "Tailwind", color: "text-cyan-400" },
              { name: "RabbitMQ", color: "text-orange-500" },
              { name: "OAuth", color: "text-red-400" },
              { name: "Swagger", color: "text-green-300" },
              { name: "Vite", color: "text-yellow-400" },
              { name: "JWT", color: "text-pink-400" },
              { name: "OpenAI", color: "text-purple-400" },
              { name: "Gemini", color: "text-blue-300" },
            ].map((tech, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition">
                <span className={`text-2xl font-bold ${tech.color}`}>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demo" className="px-6 py-20 bg-gradient-to-br from-gray-900 to-indigo-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your CRM Experience?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Join businesses that are already managing their customers more efficiently with CRM-DASH-PRO
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/login" 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium transition flex items-center justify-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRightIcon className="w-5 h-5" />
            </a>
            <a 
              href="#features" 
              className="px-6 py-3 border border-gray-700 hover:border-indigo-400 rounded-md font-medium transition"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <CogIcon className="w-6 h-6 text-indigo-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                CRM-DASH-PRO
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CRM-DASH-PRO. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}