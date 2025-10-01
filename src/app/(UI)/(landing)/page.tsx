"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ChevronRightIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  StarIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

export default function PDFEditorLanding() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 25,
        y: (e.clientY - window.innerHeight / 2) / 25,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.3, staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
    },
  };

  const floatingVariants: Variants = {
    float: {
      y: [-10, 10, -10],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="min-h-screen font-poppins flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-emerald-500/20 rounded-full blur-3xl"
          animate={{ x: mousePosition.x, y: mousePosition.y, scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-r from-lime-400/20 to-teal-500/20 rounded-full blur-3xl"
          animate={{ x: -mousePosition.x, y: -mousePosition.y, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              NovaDocs
            </h1>
          </motion.div>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            {["Features", "Pricing", "Download"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                {item}
                <motion.div
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <main className="flex-1 container mx-auto px-6 py-20 relative z-10">
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-16"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div variants={itemVariants} className="mb-6">
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-full text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-8 border border-cyan-200 dark:border-cyan-700"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
              >
                <StarIcon className="w-4 h-4 mr-2" />
                Trusted by 10,000+ professionals
              </motion.div>

              <motion.h2
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
                variants={itemVariants}
              >
                <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Edit PDFs Like
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Never Before
                </span>
              </motion.h2>
            </motion.div>

            <motion.p
              className="text-slate-600 dark:text-slate-300 mb-10 text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto lg:mx-0"
              variants={itemVariants}
            >
              Transform your PDFs with our cutting-edge editor. Add annotations, digital signatures, and collaborate seamlessly—all in your browser.
            </motion.p>

            {/* CTA */}
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12" variants={itemVariants}>
              <motion.a
                href="#download"
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-2xl shadow-xl hover:shadow-2xl font-semibold text-lg overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Get Started Free
                  <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.a>

              <motion.a
                href="#features"
                className="px-8 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl hover:border-cyan-300 dark:hover:border-cyan-500 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all text-lg font-medium text-center"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                Watch Demo
              </motion.a>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div className="flex-1 relative" variants={itemVariants}>
            <motion.div className="relative" variants={floatingVariants} animate="float">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-3xl blur-2xl"></div>
              <motion.div
                className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
                whileHover={{ scale: 1.02 }}
              >
                <Image src="/pdf-editor-hero.png" alt="PDF Editor Interface" width={600} height={450} className="w-full h-auto" priority />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20 relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}>
          <h3 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Powerful Features
          </h3>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Everything you need to work with PDFs efficiently and professionally
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: PencilSquareIcon,
              title: "Smart Editing",
              description: "Advanced text recognition and editing capabilities with real-time collaboration.",
              gradient: "from-cyan-500 to-teal-500"
            },
            {
              icon: DocumentTextIcon,
              title: "Rich Annotations",
              description: "Highlight, comment, draw, and add multimedia annotations with ease.",
              gradient: "from-emerald-500 to-lime-500"
            },
            {
              icon: ShieldCheckIcon,
              title: "Digital Security",
              description: "Enterprise-grade encryption, digital signatures, and access controls.",
              gradient: "from-teal-500 to-cyan-500"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="group relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <motion.div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </motion.div>
              <h4 className="font-bold text-2xl mb-4">{feature.title}</h4>
              <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className="bg-gradient-to-r from-slate-900 via-cyan-900 to-emerald-900 py-20 mt-auto relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h3 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your PDFs?
          </motion.h3>
          <motion.p className="text-cyan-200 mb-10 text-xl max-w-2xl mx-auto">
            Join thousands of professionals who trust NovaDocs for their document needs
          </motion.p>
          <motion.a
            href="#download"
            className="inline-flex items-center px-12 py-5 bg-white text-slate-900 rounded-2xl shadow-2xl hover:shadow-3xl font-bold text-xl"
          >
            Start Free Trial Today
            <ChevronRightIcon className="w-6 h-6 ml-3" />
          </motion.a>
          <div className="mt-8 text-cyan-300 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
