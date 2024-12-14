import { Fragment, useState , useEffect} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Calendar, X } from 'lucide-react';
import type { Task } from './types/index';
import { TaskStepper } from './TaskStepper';
import axios from 'axios';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}


export const TaskDrawer = ({ isOpen, onClose, task }: TaskDrawerProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchCurrentStep = async () => {
      if (isOpen) {
        try {
          const response = await axios.post(`http://localhost:5000/api/latest-active-step`,{
            managerTaskId : task._id
          });
          const latestStep = response.data.latestActiveStep;
          setCurrentStep(latestStep + 1);
        } catch (error) {
          console.error('Error fetching latest active step:', error);
        }
      }
    };

    fetchCurrentStep();
  }, [isOpen, task.managerTaskId]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden" onClose={onClose}>
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-500"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="pointer-events-auto fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Task Details
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={onClose}
                      >
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
                        <dl className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                            <dd className="mt-1 text-sm">
                              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-indigo-800 text-md font-medium">
                                {task.projectName}
                              </span>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                            <dd className="mt-1 text-sm text-gray-900 flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{new Date(task.deadline).toLocaleString()}</span>
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <TaskStepper currentStep={currentStep} setCurrentStep={setCurrentStep} task={task} />
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
