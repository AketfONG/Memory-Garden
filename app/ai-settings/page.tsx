"use client";
import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";

export default function AISettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/ai-config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: any) => {
    try {
      const response = await fetch('/api/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          config: updates
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
        alert('Configuration saved! 🌱');
      }
    } catch (error) {
      alert('Failed to save configuration');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <Navigation />
        <main className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-2xl">Loading AI settings...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navigation />
      
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              AI Therapist Settings
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Customize your AI therapist's personality and responses.
            </p>
          </div>

          {config && (
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🌱 Personality</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={config.personality?.role || 'compassionate_therapist'}
                    onChange={(e) => updateConfig({
                      personality: { ...config.personality, role: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="compassionate_therapist">Compassionate Therapist</option>
                    <option value="supportive_friend">Supportive Friend</option>
                    <option value="mindfulness_guide">Mindfulness Guide</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                  <select
                    value={config.personality?.tone || 'warm_and_empathetic'}
                    onChange={(e) => updateConfig({
                      personality: { ...config.personality, tone: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="warm_and_empathetic">Warm & Empathetic</option>
                    <option value="gentle_and_caring">Gentle & Caring</option>
                    <option value="calm_and_grounding">Calm & Grounding</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/testing'}
              className="px-8 py-4 bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
            >
              Test Your AI Therapist
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 