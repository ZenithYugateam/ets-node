import { Component, Contact } from './types';
import { Layers, CheckCircle2, XCircle } from 'lucide-react';

interface ComponentListProps {
  components: Component[];
  selectedContact: Contact;
  onToggleVisibility: (componentId: string, isVisible: boolean) => void;
}

export function ComponentList({ 
  components, 
  selectedContact, 
  onToggleVisibility 
}: ComponentListProps) {
  const isManager = components[0]?.type === 'manager';
  const headerBg = isManager ? 'bg-accent-50' : 'bg-primary-50';
  const headerText = isManager ? 'text-accent-700' : 'text-primary-700';
  const headerIcon = isManager ? 'text-accent-500' : 'text-primary-500';
  const toggleBg = isManager ? 'peer-checked:bg-accent-600' : 'peer-checked:bg-primary-600';

  return (
    <div className="bg-white shadow rounded-lg">
      <div className={`px-3 md:px-4 py-4 md:py-5 border-b border-gray-200 ${headerBg}`}>
        <div className="flex items-center">
          <Layers className={`h-5 w-5 ${headerIcon}`} />
          <h2 className={`ml-2 text-base md:text-lg font-medium ${headerText} truncate`}>
            Components for {selectedContact.name}
          </h2>
        </div>
      </div>

      <div className="p-3 md:p-4">
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
          {components.map((component) => (
            <div
              key={component.id}
              className="border rounded-lg p-3 md:p-4 bg-white hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                  {component.is_visible ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  )}
                  <span className="font-medium text-gray-900 truncate">{component.name}</span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={component.is_visible}
                    onChange={(e) => onToggleVisibility(component.id, e.target.checked)}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${toggleBg} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}