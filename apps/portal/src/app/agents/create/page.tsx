'use client';

import { useState } from 'react';
import { Sparkles, Bot, MessageSquare, Code, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateAgentWithAIPage() {
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'research' | 'planning' | 'coding' | 'testing' | 'complete'>('input');

  const handleCreateAgent = async () => {
    if (!description.trim()) return;
    
    setIsCreating(true);
    setCurrentStep('research');
    
    // Simulate the AI agent creation process
    setTimeout(() => setCurrentStep('planning'), 2000);
    setTimeout(() => setCurrentStep('coding'), 4000);
    setTimeout(() => setCurrentStep('testing'), 6000);
    setTimeout(() => setCurrentStep('complete'), 8000);
    setTimeout(() => setIsCreating(false), 8000);
  };

  const renderStep = (step: string, title: string, description: string, icon: React.ReactNode, isActive: boolean, isComplete: boolean) => (
    <div className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
      isActive ? 'bg-cyan-400/20 border border-cyan-400' : 
      isComplete ? 'bg-green-400/20 border border-green-400' : 
      'bg-gray-800 border border-gray-700'
    }`}>
      <div className={`p-2 rounded-lg ${
        isActive ? 'bg-cyan-400 text-black' : 
        isComplete ? 'bg-green-400 text-black' : 
        'bg-gray-700 text-gray-400'
      }`}>
        {isComplete ? <CheckCircle className="h-5 w-5" /> : icon}
      </div>
      <div>
        <h3 className={`font-semibold ${
          isActive ? 'text-cyan-400' : 
          isComplete ? 'text-green-400' : 
          'text-gray-300'
        }`}>
          {title}
        </h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-black text-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Agent Created Successfully!</h1>
            <p className="text-gray-400 mb-8">
              Your AI agent has been created and is ready to use. You can now test it, refine it, and deploy it.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/agents"
                className="px-6 py-3 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium"
              >
                View All Agents
              </Link>
              <button
                onClick={() => {
                  setCurrentStep('input');
                  setDescription('');
                }}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Create Another Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Create Agent with AI</h1>
          </div>
          <p className="text-xl text-gray-400">
            Describe what you need in natural language, and our AI will create your agent
          </p>
        </div>

        {/* Input Section */}
        {currentStep === 'input' && (
          <div className="mb-12">
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
              <h2 className="text-2xl font-semibold text-white mb-4">What do you need your agent to do?</h2>
              <p className="text-gray-400 mb-6">
                Be as specific as possible. For example: "I need an agent that can schedule appointments, 
                check availability in Google Calendar, and send confirmation emails."
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your agent's purpose, capabilities, and any specific requirements..."
                className="w-full h-32 p-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-cyan-400 focus:outline-none resize-none"
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCreateAgent}
                  disabled={!description.trim() || isCreating}
                  className="px-8 py-3 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Create Agent with AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {isCreating && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-6">Creating Your Agent...</h2>
            
            {renderStep(
              'research',
              'Research & Analysis',
              'AI is researching requirements, APIs, and best practices',
              <MessageSquare className="h-5 w-5" />,
              currentStep === 'research',
              currentStep === 'planning' || currentStep === 'coding' || currentStep === 'testing' || currentStep === 'complete'
            )}
            
            {renderStep(
              'planning',
              'Planning & Architecture',
              'AI is designing the agent structure and workflow',
              <Bot className="h-5 w-5" />,
              currentStep === 'planning',
              currentStep === 'coding' || currentStep === 'testing' || currentStep === 'complete'
            )}
            
            {renderStep(
              'coding',
              'Code Generation',
              'AI is implementing the agent code and configuration',
              <Code className="h-5 w-5" />,
              currentStep === 'coding',
              currentStep === 'testing' || currentStep === 'complete'
            )}
            
            {renderStep(
              'testing',
              'Testing & Validation',
              'AI is testing the agent and validating functionality',
              <CheckCircle className="h-5 w-5" />,
              currentStep === 'testing',
              currentStep === 'complete'
            )}
          </div>
        )}

        {/* Examples */}
        {currentStep === 'input' && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-white mb-4">Example Agent Descriptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h4 className="font-semibold text-white mb-2">Customer Service Agent</h4>
                <p className="text-sm text-gray-400">
                  "I need an agent that can answer customer questions, handle common support requests, 
                  and escalate complex issues to human agents."
                </p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h4 className="font-semibold text-white mb-2">Lead Qualification Agent</h4>
                <p className="text-sm text-gray-400">
                  "I need an agent that can qualify leads by asking relevant questions, 
                  scoring responses, and scheduling sales calls for qualified prospects."
                </p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h4 className="font-semibold text-white mb-2">Data Analysis Agent</h4>
                <p className="text-sm text-gray-400">
                  "I need an agent that can analyze CSV data, generate insights, 
                  create visualizations, and send automated reports."
                </p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h4 className="font-semibold text-white mb-2">Appointment Scheduler</h4>
                <p className="text-sm text-gray-400">
                  "I need an agent that can check calendar availability, 
                  book appointments, send confirmations, and handle rescheduling."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Agents */}
        <div className="mt-12 text-center">
          <Link
            href="/agents"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Agent Registry
          </Link>
        </div>
      </div>
    </div>
  );
}
