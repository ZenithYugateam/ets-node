import { useState, useEffect, SetStateAction } from "react";
import axios from "axios";
import { ContactList } from "./ContactList";
import { ComponentList } from "./ComponentList";
import { Users2, Building2 } from "lucide-react";

export default function AccessList() {
  const [contactType, setContactType] = useState("employee");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [components, setComponents] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get("https://ets-node-1.onrender.com/users-get-data");
        const filteredContacts = response.data
          .filter((user) => user.role.toLowerCase() === contactType)
          .map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            department: formatDepartments(user.departments),
            tooltip: generateTooltip(user.departments),
          }));
        setContacts(filteredContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [contactType]);

  // Fetch components and initialize their states when a contact is selected
  useEffect(() => {
    const fetchComponents = async () => {
      if (selectedContact) {
        try {
          const response = await axios.get(
            `https://ets-node-1.onrender.com/users/${selectedContact.id}/access-list`
          );
          const accessList = response.data.accessList || {};
  
          // Define available components
          const availableComponents = [
            { id: "worksheet", name: "Worksheet" },
            { id: "leave_request", name: "Leave Request" },
            { id: "attendance_view", name: "Attendance View" },
            { id: "ivms", name: "iVMS" },
          ];
  
          // Filter components based on contact type
          const filteredComponents =
            contactType === "employee"
              ? availableComponents.filter(
                  (component) =>
                    component.id === "worksheet" || component.id === "leave_request"
                )
              : availableComponents;
  
          // Map and initialize components
          const initializedComponents = filteredComponents.map((component) => ({
            ...component,
            is_visible: accessList[component.id] ?? false,
          }));
  
          setComponents(initializedComponents);
        } catch (error) {
          console.error("Error fetching access list:", error);
        }
      }
    };
  
    fetchComponents();
  }, [selectedContact, contactType]);
  

  const handleContactTypeChange = (type) => {
    if (type !== contactType) {
      setIsTransitioning(true);
      setContactType(type);
      setSelectedContact(null);
      setComponents([]);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleContactSelect = (contact: SetStateAction<null>) => {
    setSelectedContact(contact);
  };

  const handleToggleVisibility = async (componentId: unknown, isVisible: unknown) => {
    if (!selectedContact) return;

    const updatedComponents = components.map((comp) =>
      comp.id === componentId ? { ...comp, is_visible: isVisible } : comp
    );
    setComponents(updatedComponents);

    try {
      await axios.patch(
        `https://ets-node-1.onrender.com/users/${selectedContact.id}/access-list`,
        { componentId, isVisible }
      );
    } catch (error) {
      console.error("Error updating component visibility:", error);
    }
  };

  const formatDepartments = (departments: unknown[]) =>
    departments.length > 2
      ? departments.slice(0, 2).join(", ") + " ..."
      : departments.join(", ");

  const generateTooltip = (departments: unknown[]) =>
    departments.length > 2 ? departments.slice(2).join(", ") : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <nav className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center">
            <h1 className="text-lg md:text-xl font-semibold text-primary-900">Component Manager</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg bg-white shadow-sm p-1">
            <button
              onClick={() => handleContactTypeChange("employee")}
              className={`inline-flex items-center px-3 md:px-4 py-2 rounded-md text-sm font-medium ${
                contactType === "employee"
                  ? "bg-primary-600 text-white"
                  : "text-primary-600 hover:bg-primary-50"
              }`}
            >
              <Users2 className="w-4 h-4 mr-1.5 md:mr-2" />
              Employees
            </button>
            <button
              onClick={() => handleContactTypeChange("manager")}
              className={`inline-flex items-center px-3 md:px-4 py-2 rounded-md text-sm font-medium ${
                contactType === "manager"
                  ? "bg-accent-600 text-white"
                  : "text-accent-600 hover:bg-accent-50"
              }`}
            >
              <Building2 className="w-4 h-4 mr-1.5 md:mr-2" />
              Managers
            </button>
          </div>
        </div>

        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <ContactList
            contacts={contacts}
            type={contactType}
            selectedContact={selectedContact}
            onContactSelect={handleContactSelect}
          />

          {selectedContact && (
            <div className="mt-4 md:mt-6">
              <ComponentList
                components={components}
                selectedContact={selectedContact}
                onToggleVisibility={handleToggleVisibility}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
