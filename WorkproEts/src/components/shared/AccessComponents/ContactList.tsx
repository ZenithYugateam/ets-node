import React from "react";
import { Mail, Building, ChevronRight } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface ContactListProps {
  contacts: Contact[];
  type: "manager" | "employee";
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
}

export function ContactList({ contacts, type, selectedContact, onContactSelect }: ContactListProps) {
  const isManager = type === "manager";
  const gradientColors = isManager ? "from-accent-400 to-accent-600" : "from-primary-400 to-primary-600";
  const selectedBg = isManager ? "bg-accent-50" : "bg-primary-50";
  const selectedIcon = isManager ? "text-accent-600" : "text-primary-600";

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Table view for larger screens */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                onClick={() => onContactSelect(contact)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? selectedBg : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center`}>
                    <span className="text-white font-medium">{contact.name.charAt(0)}</span>
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-900">{contact.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {contact.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  {contact.department}
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight className={`h-5 w-5 ${
                    selectedContact?.id === contact.id ? selectedIcon : "text-gray-400"
                  }`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden divide-y divide-gray-200">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onContactSelect(contact)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedContact?.id === contact.id ? selectedBg : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center`}>
                  <span className="text-white text-lg font-medium">{contact.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{contact.email}</div>
                  <div className="text-sm text-gray-600 mt-1">{contact.department}</div>
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 ${
                selectedContact?.id === contact.id ? selectedIcon : "text-gray-400"
              }`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
