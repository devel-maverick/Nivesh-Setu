import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Github, ArrowRight, Shield, Zap, Lock, BookOpen, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

const team = [
  {
    name: 'Vinay Sharma',
    role: 'Quant Developer',
    description: 'Risk modeling, Monte Carlo simulation, Markowitz optimization',
    avatar: 'VS',
  },
  {
    name: 'Ashvin Tiwari',
    role: 'Backend Engineer',
    description: 'FastAPI development, data processing, ML pipeline integration',
    avatar: 'AT',
  },
  {
    name: 'Sumit Kumar',
    role: 'Frontend Developer',
    description: 'React dashboard, Plotly visualizations, UI/UX design',
    avatar: 'SK',
  },
]

const techStack = [
  { name: 'React 18', category: 'Frontend' },
  { name: 'Vite', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Plotly.js', category: 'Frontend' },
  { name: 'Clerk', category: 'Auth' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'Python 3.11', category: 'ML Engine' },
  { name: 'NumPy / SciPy', category: 'ML Engine' },
  { name: 'Scikit-learn', category: 'ML Engine' },
  { name: 'yfinance', category: 'Data' },
  { name: 'pytrends', category: 'Data' },
]

const categoryColors = {
  Frontend: 'badge-blue',
  Auth: 'badge-amber',
  Backend: 'badge-cyan',
  'ML Engine': 'badge-green',
  Data: 'badge-red',
}

export default function About() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-20">
        <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
          <TrendingUp size={28} className="text-zinc-50" />
        </div>
        <h1 className="font-heading text-5xl font-bold text-text-primary mb-4">
          About <span className="text-zinc-400">Nivesh-Setu</span>
        </h1>
        <p className="section-subheading mx-auto text-lg">
          <strong>"Bridge to Investment"</strong> in Hindi. We built Nivesh-Setu to democratize institutional-grade risk analytics for retail investors — for free.
        </p>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="badge-blue mb-4 inline-flex">Our Mission</div>
            <h2 className="font-heading text-3xl font-bold text-text-primary mb-4">
              No Bloomberg Terminal required
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Professional risk metrics like VaR, CVaR, Sharpe Ratio, and Efficient Frontier are locked behind expensive institutional platforms. Retail investors making decisions without these tools are essentially flying blind.
            </p>
            <p className="text-text-secondary leading-relaxed">
              We built Nivesh-Setu to change that. Every algorithm runs open-source, every metric is explained, and every retail investor can now access the same risk intelligence that hedge funds use — completely free.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Open Source', desc: 'All algorithms are transparent and auditable', icon: Lock },
              { title: 'Free Forever', desc: 'Core analytics will always be free', icon: Shield },
              { title: 'No Data Storage', desc: 'Your portfolio stays on your device', icon: Zap },
              { title: 'Educational', desc: 'Learn how every metric is computed', icon: BookOpen },
            ].map(item => (
              <div key={item.title} className="card text-center">
                <item.icon size={24} className="text-zinc-400 mx-auto mb-3" />
                <div className="font-heading font-semibold text-text-primary text-sm mb-1">{item.title}</div>
                <div className="text-text-muted text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="text-center mb-12">
          <div className="badge-cyan mb-4 inline-flex">The Team</div>
          <h2 className="font-heading text-3xl font-bold text-text-primary">Built by quants & engineers</h2>
        </div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="grid md:grid-cols-3 gap-6"
        >
          {team.map(member => (
            <motion.div 
              key={member.name} 
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
              }}
              whileHover={{ y: -5 }}
              className="card text-center transition-shadow hover:shadow-card-hover"
            >
              <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-800 flex items-center justify-center mx-auto mb-4 font-heading font-bold text-lg text-zinc-300">
                {member.avatar}
              </div>
              <h3 className="font-heading font-semibold text-text-primary text-base mb-1">{member.name}</h3>
              <div className="badge-blue mb-3 inline-flex text-xs">{member.role}</div>
              <p className="text-text-secondary text-sm">{member.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="text-center mb-12">
          <div className="badge-green mb-4 inline-flex">Technology</div>
          <h2 className="font-heading text-3xl font-bold text-text-primary mb-6">Built on proven open-source</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card border-green-500/20 bg-green-500/5 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <Github className="text-green-400" size={24} />
                <h3 className="font-heading font-semibold text-lg text-text-primary">Fully Open Source</h3>
              </div>
              <p className="text-text-secondary leading-relaxed mb-4">
                Nivesh-Setu is proudly open source. You can audit our risk models, Monte Carlo simulations, and ML forecasting pipelines directly on GitHub. We believe in complete transparency for financial tools.
              </p>
              <a href="https://github.com/devel-maverick/Nivesh-Setu" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 font-medium inline-flex items-center text-sm transition-colors">
                View Repository <ArrowRight size={16} className="ml-1" />
              </a>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card border-blue-500/20 bg-blue-500/5 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="text-blue-400" size={24} />
                <h3 className="font-heading font-semibold text-lg text-text-primary">Self-Hostable</h3>
              </div>
              <p className="text-text-secondary leading-relaxed mb-4">
                Want complete privacy? You can run Nivesh-Setu entirely on your local machine or private cloud. Our Python FastAPI backend and React frontend are designed to be easily deployable anywhere.
              </p>
              <div className="bg-zinc-950 p-3 rounded-md font-mono text-xs text-zinc-400 border border-zinc-800">
                <div className="text-zinc-500 mb-1"># Clone and run locally</div>
                <div>git clone https://github.com/devel-maverick/Nivesh-Setu.git</div>
              </div>
            </motion.div>
          </div>


          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card max-w-4xl mx-auto border-dashed border-zinc-800 bg-transparent"
          >
            <div className="flex flex-wrap gap-3 justify-center p-6">
              {techStack.map(tech => (
                <motion.span 
                  key={tech.name} 
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-lg border cursor-default ${categoryColors[tech.category]}`}
                >
                   {tech.name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
          Ready to analyze your portfolio?
        </h2>
        <div className="flex gap-4 justify-center">
          <Link to="/signup" className="btn-primary">
            Start Now <ArrowRight size={16} className="ml-2" />
          </Link>
          <a href="https://github.com/devel-maverick/Nivesh-Setu" target="_blank" rel="noopener noreferrer" className="btn-secondary gap-2">
            <Github size={16} /> View on GitHub
          </a>
        </div>
      </section>
    </div>
  )
}
