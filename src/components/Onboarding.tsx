import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Briefcase, Users, Layout, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface OnboardingProps {
  onComplete: (companyName: string) => void;
}

const INDUSTRIES = [
  'Technology', 'Marketing', 'Education', 'Healthcare', 'Finance', 
  'Real Estate', 'Manufacturing', 'Retail', 'Non-Profit', 'Other'
];

const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees'
];

const SECTIONS = [
  'Project Management', 'CRM & Sales', 'Software Development', 
  'Marketing Campaigns', 'HR & Recruitment', 'Inventory Tracking'
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    companyName: '',
    email: '',
    industry: '',
    companySize: '',
    sectionsToManage: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleSection = (section: string) => {
    setFormData(prev => ({
      ...prev,
      sectionsToManage: prev.sectionsToManage.includes(section)
        ? prev.sectionsToManage.filter(s => s !== section)
        : [...prev.sectionsToManage, section]
    }));
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    setError(null);
    const path = `users/${auth.currentUser.uid}`;
    try {
      const profile = {
        uid: auth.currentUser.uid,
        ...formData,
        onboardingCompleted: true,
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', auth.currentUser.uid), profile);
      onComplete(formData.companyName);
    } catch (err) {
      console.error('Onboarding failed', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch (formattedErr: any) {
        setError(formattedErr.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome</h1>
              <p className="text-slate-500 text-lg">Let's get your company set up</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                />
              </div>
            </div>
            <button
              onClick={nextStep}
              disabled={!formData.companyName || !formData.email}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">What's your industry?</h2>
              <p className="text-slate-500">This helps us tailor your experience</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INDUSTRIES.map(industry => (
                <button
                  key={industry}
                  onClick={() => setFormData({ ...formData, industry })}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all hover:border-indigo-500",
                    formData.industry === industry 
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600"
                  )}
                >
                  <Briefcase className={cn("w-5 h-5 mb-2", formData.industry === industry ? "text-indigo-600" : "text-slate-400")} />
                  <span className="font-medium">{industry}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.industry}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">How big is your team?</h2>
              <p className="text-slate-500">We'll optimize the platform for your scale</p>
            </div>
            <div className="space-y-3">
              {COMPANY_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setFormData({ ...formData, companySize: size })}
                  className={cn(
                    "w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between",
                    formData.companySize === size 
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Users className={cn("w-6 h-6", formData.companySize === size ? "text-indigo-600" : "text-slate-400")} />
                    <span className="font-semibold text-lg">{size}</span>
                  </div>
                  {formData.companySize === size && <CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.companySize}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">What do you need to manage?</h2>
              <p className="text-slate-500">Select all that apply to your workflow</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {SECTIONS.map(section => (
                <button
                  key={section}
                  onClick={() => toggleSection(section)}
                  className={cn(
                    "p-5 rounded-2xl border text-left transition-all flex items-center justify-between",
                    formData.sectionsToManage.includes(section)
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Layout className={cn("w-6 h-6", formData.sectionsToManage.includes(section) ? "text-indigo-600" : "text-slate-400")} />
                    <span className="font-semibold text-lg">{section}</span>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    formData.sectionsToManage.includes(section) ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                  )}>
                    {formData.sectionsToManage.includes(section) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={formData.sectionsToManage.length === 0 || isSubmitting}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Setting up...' : 'Launch Dashboard'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 px-4">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-500",
                step >= i ? "bg-indigo-600" : "bg-slate-200"
              )} 
            />
          ))}
        </div>

        <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm overflow-auto max-h-40">
              <p className="font-bold mb-1">Setup Error:</p>
              <pre className="whitespace-pre-wrap">{error}</pre>
            </div>
          )}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
