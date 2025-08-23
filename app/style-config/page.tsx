'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

interface StyleComponent {
  id: string;
  name: string;
  category: string;
  code: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export default function StyleConfigPage() {
  const [components, setComponents] = useState<StyleComponent[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);


  useEffect(() => {
    // Clear localStorage to force refresh with new Style C and D
    localStorage.removeItem('styledComponents');
    loadComponents();
    // Add default component if none exist
    const saved = localStorage.getItem('styledComponents');
    if (!saved || JSON.parse(saved).length === 0) {
      addDefaultComponent();
    }
  }, []);

  const addDefaultComponent = () => {
    const defaultComponents: StyleComponent[] = [
      {
        id: 'default-plant-button',
        name: 'Style 1 - Plant Your First Memory Button',
        category: 'buttons',
        code: `<button className="bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-3">
  <span>🪴</span>
  <span>Plant Your First Memory</span>
</button>`,
        description: 'Main CTA button style used on the homepage for planting memories. Features gradient background, hover effects, and scaling animation.',
        tags: ['cta', 'gradient', 'hover', 'scale', 'main-button', 'style-1'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-garden-button',
        name: 'Style 2 - View My Garden Button',
        category: 'buttons',
        code: `<button className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-full text-xl font-semibold transition-all duration-300 hover:border-emerald-300 hover:scale-105 flex items-center space-x-3">
  <span>🌱</span>
  <span>View My Garden</span>
</button>`,
        description: 'Secondary button style used on the homepage for viewing the garden. Features outlined design with hover effects and scaling animation.',
        tags: ['outline', 'border', 'hover', 'scale', 'secondary-button', 'style-2'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-ai-therapist-button',
        name: 'Style 3 - Customize AI Therapist Button',
        category: 'buttons',
        code: `<a href="#" className="inline-block px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out">
  ⚙️ Customize AI Therapist
</a>`,
        description: 'Settings button style used for AI therapist customization. Features light emerald background with hover effects.',
        tags: ['settings', 'light', 'hover', 'ai', 'style-3'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-invite-others-button',
        name: 'Style 4 - Invite Others Button',
        category: 'buttons',
        code: `<a href="#" className="w-fit inline-block bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 text-emerald-600 px-12 py-5 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
  👥 Invite Others
</a>`,
        description: 'Social button style used on the garden page for inviting others. Features gradient background with hover effects and scaling animation.',
        tags: ['social', 'gradient', 'hover', 'scale', 'invite', 'style-4'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-gentle-growth-card',
        name: 'Style A - Gentle Growth Card Background',
        category: 'cards',
        code: `<div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100">
  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
    <span className="text-3xl">🌱</span>
  </div>
  <h3 className="text-xl font-semibold text-gray-800 mb-4">Gentle Growth</h3>
  <p className="text-gray-600 leading-relaxed">Nurture your memories with care, just like tending to delicate seedlings. Watch them grow stronger and more beautiful over time.</p>
</div>`,
        description: 'Feature card background style used on the homepage for the Gentle Growth card. Features gradient background, rounded corners, and hover effects.',
        tags: ['card', 'gradient', 'hover', 'feature', 'background', 'style-a'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-testing-page-background',
        name: 'Style B - Testing Page Background',
        category: 'backgrounds',
        code: `<div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100">
  {/* Your content here */}
</div>`,
        description: 'Clean white background style used on the testing page. Features white background, rounded corners, shadow, and emerald outline for elegant presentation.',
        tags: ['background', 'white', 'rounded', 'shadow', 'outline', 'emerald', 'style-b'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-emotional-journey-background',
        name: 'Style C - Every Memory Has a Heartbeat Background',
        category: 'backgrounds',
        code: `<div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-12 backdrop-blur-md">
  {/* Your content here */}
</div>`,
        description: 'Soft gradient background style used for the Emotional Journey section. Features gentle emerald to green gradient with backdrop blur for dreamy effect.',
        tags: ['background', 'gradient', 'emerald', 'green', 'soft', 'dreamy', 'style-c'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-cta-background',
        name: 'Style D - Ready to Start Your Memory Garden Background',
        category: 'backgrounds',
        code: `<div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-12 text-white shadow-xl">
  {/* Your content here */}
</div>`,
        description: 'Bold gradient background style used for the CTA section. Features vibrant emerald to green gradient with white text and shadow for strong visual impact.',
        tags: ['background', 'gradient', 'emerald', 'green', 'bold', 'cta', 'style-d'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-people-card-tags',
        name: 'Style E - People Card Tags',
        category: 'tags',
        code: `<span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Tag Name</span>`,
        description: 'Tag style used on people cards in the about page. Features light emerald background with emerald text and rounded pill shape.',
        tags: ['tag', 'pill', 'emerald', 'light', 'rounded', 'style-e'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-chat-interface',
        name: 'Style CHAT - Chat Interface',
        category: 'interfaces',
        code: `<div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
  {/* Chat Header */}
  <div className="bg-white p-6">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
        <span className="text-emerald-600 text-lg">🌱</span>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">Sprout</h3>
        <p className="text-sm text-emerald-500 font-medium">Your nurturing companion</p>
      </div>
    </div>
  </div>

  {/* Chat Messages */}
  <div className="h-96 overflow-y-auto p-6 space-y-4">
    {/* User Message */}
    <div className="flex justify-end">
      <div className="max-w-xs px-4 py-3 rounded-2xl bg-emerald-600 text-white">
        <p className="text-sm">Hello! How are you today?</p>
        <p className="text-xs opacity-70 mt-1">2:30 PM</p>
      </div>
    </div>
    
    {/* Assistant Message */}
    <div className="flex justify-start">
      <div className="max-w-xs px-4 py-3 rounded-2xl bg-emerald-50 text-gray-800">
        <p className="text-sm">I'm doing well, thank you for asking! How can I help you today?</p>
        <p className="text-xs opacity-70 mt-1">2:31 PM</p>
      </div>
    </div>
  </div>

  {/* Chat Input */}
  <div className="p-6 relative">
    <form className="flex space-x-3">
      <input
        type="text"
        placeholder="Share what's on your heart..."
        className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 placeholder-gray-500 bg-white"
      />
      <button
        type="submit"
        className="bg-gradient-to-b from-emerald-500 to-green-600 text-white w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </form>
  </div>
</div>`,
        description: 'Complete chat interface style used in the testing page. Features header with avatar, message bubbles, and input area with send button.',
        tags: ['chat', 'interface', 'messages', 'input', 'avatar', 'style-chat'],
        createdAt: new Date().toISOString()
      }
    ];
    saveComponents(defaultComponents);
  };

  const loadComponents = () => {
    try {
      const saved = localStorage.getItem('styledComponents');
      if (saved) {
        setComponents(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading components:', error);
    }
  };

  const saveComponents = (newComponents: StyleComponent[]) => {
    try {
      localStorage.setItem('styledComponents', JSON.stringify(newComponents));
      setComponents(newComponents);
    } catch (error) {
      console.error('Error saving components:', error);
    }
  };

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Function to render the component preview
  const renderComponentPreview = (code: string) => {
    // Extract the className from the code
    const classNameMatch = code.match(/className="([^"]+)"/);
    if (!classNameMatch) return null;

    const className = classNameMatch[1];
    
    // Extract the content between the opening and closing tags
    const contentMatch = code.match(/<[^>]+>([\s\S]*?)<\/[^>]+>/);
    if (!contentMatch) return null;

    const content = contentMatch[1].trim();
    
    // Create a simple preview based on the component type
    if (code.includes('<button')) {
      return (
        <div className="flex justify-center p-4">
          <button 
            className={className}
            onClick={(e) => e.preventDefault()}
          >
            {content.includes('🪴') ? (
              <>
                <span>🪴</span>
                <span>Plant Your First Memory</span>
              </>
            ) : content.includes('🌱') ? (
              <>
                <span>🌱</span>
                <span>View My Garden</span>
              </>
            ) : content.includes('⚙️') ? (
              <>
                <span>⚙️</span>
                <span>Customize AI Therapist</span>
              </>
            ) : content.includes('👥') ? (
              <>
                <span>👥</span>
                <span>Invite Others</span>
              </>
            ) : (
              <span>Button Preview</span>
            )}
          </button>
        </div>
      );
    }
    
    // Handle soft gradient background elements (Style C)
    if (code.includes('<div') && className.includes('bg-gradient-to-br') && className.includes('from-emerald-50') && className.includes('via-green-50')) {
      return (
        <div className="flex justify-center p-4">
          <div className={className} style={{width: '100%'}}>
            <div className="p-4 text-center">
              <div className="w-16 h-2 bg-white bg-opacity-80 rounded mx-auto mb-2"></div>
              <div className="w-12 h-2 bg-white bg-opacity-80 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      );
    }
    
    // Handle bold gradient background elements (Style D)
    if (code.includes('<div') && className.includes('bg-gradient-to-br') && className.includes('from-emerald-500') && className.includes('to-green-600')) {
      return (
        <div className="flex justify-center p-4">
          <div className={className} style={{width: '100%'}}>
            <div className="p-4 text-center">
              <div className="w-16 h-2 bg-white bg-opacity-90 rounded mx-auto mb-2"></div>
              <div className="w-12 h-2 bg-white bg-opacity-90 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      );
    }
    
    // Handle tag elements (Style E)
    if (code.includes('<span') && className.includes('px-3 py-1') && className.includes('bg-emerald-100') && className.includes('rounded-full')) {
      return (
        <div className="flex justify-center p-4">
          <div className="flex flex-wrap gap-2">
            <span className={className}>React</span>
            <span className={className}>Next.js</span>
            <span className={className}>Design</span>
          </div>
        </div>
      );
    }
    
    // Handle chat interface elements (Style CHAT)
    if (code.includes('Chat Interface') && code.includes('bg-white rounded-3xl shadow-xl border border-emerald-100')) {
      return (
        <div className="flex justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden" style={{width: '100%', maxWidth: '350px'}}>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-base">🌱</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Sprout</h3>
                  <p className="text-xs text-emerald-500 font-medium">Your nurturing companion</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-40 overflow-y-auto p-4 space-y-3">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xs px-3 py-2 rounded-2xl bg-emerald-600 text-white">
                  <p className="text-xs">Hello! How are you today?</p>
                  <p className="text-xs opacity-70 mt-1">2:30 PM</p>
                </div>
              </div>
              
              {/* Assistant Message */}
              <div className="flex justify-start">
                <div className="max-w-xs px-3 py-2 rounded-2xl bg-emerald-50 text-gray-800">
                  <p className="text-xs">I'm doing well, thank you for asking! How can I help you today?</p>
                  <p className="text-xs opacity-70 mt-1">2:31 PM</p>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-3">
                <div className="flex-1 px-4 py-2 border-2 border-emerald-200 rounded-full bg-white"></div>
                <div className="w-10 h-10 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Handle card elements (Style A)
    if (code.includes('<div') && className.includes('bg-gradient-to-br')) {
      return (
        <div className="flex justify-center p-4">
          <div className={className}>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Gentle Growth</h3>
            <p className="text-gray-600 leading-relaxed">Nurture your memories with care, just like tending to delicate seedlings.</p>
          </div>
        </div>
      );
    }
    
    // Handle background elements
    if (code.includes('<div') && className.includes('bg-white') && className.includes('min-h-screen')) {
      return (
        <div className="flex justify-center p-4">
          <div className={className} style={{minHeight: '200px', width: '100%'}}>
            <div className="p-4 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="w-16 h-2 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="w-12 h-2 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      );
    }
    
    // Handle card-style background elements (with shadow, rounded corners, border)
    if (code.includes('<div') && className.includes('bg-white') && className.includes('rounded-3xl') && className.includes('shadow-xl')) {
      return (
        <div className="flex justify-center p-4">
          <div className={className} style={{width: '100%'}}>
            <div className="p-4 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="w-16 h-2 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="w-12 h-2 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex justify-center p-4">
        <div className={className}>
          {content || 'Component Preview'}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation showBackButton={true} backButtonText="Back to Updates" backButtonHref="/updates" />

      {/* Main Content */}
      <main className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🎨 Style Configuration
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Store and access your styled components for easy reuse across projects
            </p>
          </div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <div key={component.id} className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 flex flex-col border border-emerald-100">
                {/* Component Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{component.name}</h3>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm flex-shrink-0">
                      {component.category.charAt(0).toUpperCase() + component.category.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{component.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {component.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Live Preview:</h4>
                  {renderComponentPreview(component.code)}
                </div>

                {/* Code Preview - pushed to bottom */}
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Code:</h4>
                  <div className="bg-gray-50 rounded-2xl p-4 max-h-32 overflow-y-auto flex-1">
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                      {component.code}
                    </pre>
                  </div>
                </div>

                {/* Actions - at bottom */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => copyToClipboard(component.code, component.id)}
                                               className="w-full px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out"
                  >
                    {copiedId === component.id ? '✓ Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {components.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading your style library...</h3>
            </div>
          )}
        </div>


      </main>
    </div>
  );
} 