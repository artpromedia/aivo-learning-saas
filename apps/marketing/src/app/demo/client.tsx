"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, MessageSquare, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Form field helpers                                                  */
/* ------------------------------------------------------------------ */

function InputField({
  id,
  label,
  type = "text",
  required = true,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-aivo-navy-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required}
        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors"
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  required = true,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-aivo-navy-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required}
        className={cn(
          "mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors",
          value === "" && "text-aivo-navy-300"
        )}
      >
        <option value="" disabled>
          Select...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated checkmark                                                  */
/* ------------------------------------------------------------------ */

function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-aivo-teal-50"
    >
      <motion.div
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Check className="h-10 w-10 text-aivo-teal-600" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  What to expect                                                      */
/* ------------------------------------------------------------------ */

const expectations = [
  { icon: Clock, text: "30-minute call with our education team" },
  { icon: Users, text: "Personalized walkthrough of AIVO" },
  { icon: MessageSquare, text: "Q&A session to answer all your questions" },
  { icon: DollarSign, text: "Custom pricing tailored to your needs" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function DemoPageClient() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [role, setRole] = useState("");
  const [students, setStudents] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Basic validation — native HTML validation handles required fields
    if (!firstName || !lastName || !email || !school || !role || !students) {
      return;
    }

    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl"
          >
            See AIVO in Action
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto"
          >
            Schedule a personalized demo with our education team
          </motion.p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left: Form / Success */}
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
                    noValidate
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputField
                        id="firstName"
                        label="First Name"
                        value={firstName}
                        onChange={setFirstName}
                      />
                      <InputField
                        id="lastName"
                        label="Last Name"
                        value={lastName}
                        onChange={setLastName}
                      />
                    </div>

                    <InputField
                      id="email"
                      label="Work Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                    />

                    <InputField
                      id="school"
                      label="School/District Name"
                      value={school}
                      onChange={setSchool}
                    />

                    <SelectField
                      id="role"
                      label="Role"
                      options={[
                        "Teacher",
                        "Administrator",
                        "IT Director",
                        "Curriculum Director",
                        "Other",
                      ]}
                      value={role}
                      onChange={setRole}
                    />

                    <SelectField
                      id="students"
                      label="Number of Students"
                      options={[
                        "1-50",
                        "51-200",
                        "201-500",
                        "501-1000",
                        "1000+",
                      ]}
                      value={students}
                      onChange={setStudents}
                    />

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-aivo-navy-700"
                      >
                        Message{" "}
                        <span className="text-aivo-navy-400">(optional)</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-required={false}
                        className="mt-1.5 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-2.5 text-aivo-navy-800 placeholder:text-aivo-navy-300 focus:border-aivo-purple-400 focus:outline-none focus:ring-2 focus:ring-aivo-purple-200 transition-colors resize-y"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700 focus:outline-none focus:ring-2 focus:ring-aivo-purple-500 focus:ring-offset-2"
                    >
                      Request Demo
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-aivo-navy-100 bg-white p-12 shadow-sm text-center"
                >
                  <AnimatedCheckmark />
                  <h2 className="mt-6 text-2xl font-bold text-aivo-navy-800">
                    Thank you!
                  </h2>
                  <p className="mt-3 text-lg text-aivo-navy-500 max-w-md">
                    Our team will reach out within 24 hours to schedule your
                    personalized demo.
                  </p>
                  <Link
                    href="/"
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-aivo-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
                  >
                    Back to Home
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right: Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-2xl font-bold text-aivo-navy-800">
                What to expect
              </h2>
              <ul className="mt-6 space-y-5">
                {expectations.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aivo-purple-50">
                      <Icon className="h-5 w-5 text-aivo-purple-600" />
                    </div>
                    <span className="text-aivo-navy-600 leading-relaxed pt-1.5">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-xl bg-aivo-navy-50 p-6">
                <p className="text-sm font-medium text-aivo-navy-700">
                  Prefer to reach out directly?
                </p>
                <a
                  href="mailto:sales@aivolearning.com"
                  className="mt-1 text-aivo-purple-600 font-semibold hover:text-aivo-purple-700 transition-colors"
                >
                  sales@aivolearning.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
