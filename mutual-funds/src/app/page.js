'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Brain, Shield, Calculator, ArrowRight, CheckCircle, Star, Users, Award, Zap, Clock, Globe } from 'lucide-react';
const SipCalculator = () => {
  const [investment, setInvestment] = useState(5000);
  const [years, setYears] = useState(10);
  const [returns, setReturns] = useState(12);
  const [result, setResult] = useState({ invested: 0, returns: 0, total: 0 });

  useEffect(() => {
    const months = years * 12;
    const monthlyRate = returns / 12 / 100;
    const futureValue = investment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const invested = investment * months;
    const earnings = futureValue - invested;

    setResult({
      invested: Math.round(invested),
      returns: Math.round(earnings),
      total: Math.round(futureValue)
    });
  }, [investment, years, returns]);

  return (
    <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Monthly Investment</label>
          <input
            type="range"
            min="500"
            max="100000"
            step="500"
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="text-2xl font-bold text-gray-900 mt-2">₹{investment.toLocaleString()}</div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Time Period (Years)</label>
          <input
            type="range"
            min="1"
            max="30"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="text-2xl font-bold text-gray-900 mt-2">{years} Years</div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Expected Returns (%)</label>
          <input
            type="range"
            min="1"
            max="30"
            value={returns}
            onChange={(e) => setReturns(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="text-2xl font-bold text-gray-900 mt-2">{returns}%</div>
        </div>

        <div className="pt-6 border-t border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Invested Amount</span>
            <span className="text-lg font-bold text-gray-900">₹{result.invested.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Estimated Returns</span>
            <span className="text-lg font-bold text-green-600">₹{result.returns.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-gray-900 font-bold text-lg">Total Value</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              ₹{result.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Calculator className="w-10 h-10" />,
      title: "SIP Calculator",
      description: "Plan your investments with accurate SIP projections and wealth forecasting tools.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: "Real-time Fund Data",
      description: "Access live NAV updates, performance metrics, and comprehensive fund analytics.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "AI Insights",
      description: "Get personalized investment recommendations powered by advanced algorithms.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Secure Investments",
      description: "Bank-grade security with encrypted transactions and data protection.",
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  const stats = [
    { value: "₹500Cr+", label: "Assets Under Management", icon: <TrendingUp className="w-6 h-6" /> },
    { value: "50,000+", label: "Happy Investors", icon: <Users className="w-6 h-6" /> },
    { value: "15%", label: "Average Annual Returns", icon: <Award className="w-6 h-6" /> },
    { value: "24/7", label: "Customer Support", icon: <Clock className="w-6 h-6" /> }
  ];

  const benefits = [
    "Zero commission on direct mutual funds",
    "Instant portfolio tracking & analysis",
    "Tax-saving investment options",
    "Expert-curated fund recommendations",
    "Auto-rebalancing portfolio management",
    "Goal-based investment planning"
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      content: "InvestMate made investing so simple! The SIP calculator helped me plan my retirement perfectly.",
      rating: 5
    },
    {
      name: "Rahul Verma",
      role: "Business Owner",
      content: "Best platform for mutual fund investments. The AI insights are incredibly accurate.",
      rating: 5
    },
    {
      name: "Anjali Patel",
      role: "Doctor",
      content: "Finally, a platform that understands my investment goals. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      {/* <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center group cursor-pointer">
              <div className="relative">
                <TrendingUp className="w-9 h-9 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                InvestMate
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              {['Home', 'SIP Calculator', 'Funds', 'About', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={item === 'SIP Calculator' ? '/sip' : `/${item.toLowerCase()}`}
                  className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 relative group transition-colors duration-300"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
              <button className="ml-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">India's #1 Investment Platform</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Build Wealth
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Systematically
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Start your investment journey with zero commission, expert insights, and AI-powered recommendations. Achieve your financial goals faster.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  Start Investing Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all duration-300">
                  Calculate SIP Returns
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-green-400 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">50,000+</span> investors trust us</p>
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80"
                  alt="Investment Growth"
                  className="rounded-2xl shadow-xl mb-6 w-full h-64 object-cover"
                />
                <div className="grid grid-cols-2 gap-4">
                  {stats.slice(0, 2).map((stat, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100">
                      <div className="text-blue-600 mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="flex justify-center mb-3 text-white/80 group-hover:text-white transition-colors duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools and insights designed to help you make smarter investment decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 text-blue-600 font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Investors Choose <span className="text-blue-600">InvestMate</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of smart investors who are building wealth with confidence
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400 rounded-3xl blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                alt="Investment Dashboard"
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SIP Calculator Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMC0yYy00LjQxOCAwLTggMy41ODItOCA4czMuNTgyIDggOCA4IDgtMy41ODIgOC04LTMuNTgyLTgtOC04eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-semibold">Most Advanced Calculator</span>
              </div>
              
              <h2 className="text-5xl font-bold leading-tight">
                Plan Your Financial Future Today
              </h2>
              
              <p className="text-blue-100 text-lg leading-relaxed">
                Use our advanced SIP calculator to project your returns and visualize your wealth creation journey. Get instant insights into how your investments will grow over time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  Explore Full Calculator
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300">
                  View Sample Report
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { label: "Accuracy", value: "99.9%" },
                  { label: "Users", value: "50K+" },
                  { label: "Calculations", value: "1M+" }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-blue-100 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:scale-105">
              <SipCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Trusted by Thousands of <span className="text-green-600">Happy Investors</span>
            </h2>
            <p className="text-xl text-gray-600">See what our community has to say about their experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-green-400"></div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6">Ready to Start Your Investment Journey?</h2>
          <p className="text-xl text-blue-100 mb-10">Join 50,000+ investors who are building wealth with InvestMate</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-5 bg-white text-gray-900 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300">
              Schedule a Demo
            </button>
          </div>

          <p className="mt-8 text-blue-200 text-sm">No credit card required • Free forever • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <span className="ml-2 text-2xl font-bold">InvestMate</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your trusted partner in wealth creation. We help individuals achieve their financial goals through smart, systematic investing.
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <div key={social} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                    <div className="w-5 h-5 bg-gray-400 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {['About Us', 'Our Team', 'Careers', 'Press', 'Blog'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-3">
                {['Help Center', 'SIP Calculator', 'Investment Guide', 'Tax Guide', 'FAQs'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 InvestMate. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Cookie Policy</a>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4 text-center">
              Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}