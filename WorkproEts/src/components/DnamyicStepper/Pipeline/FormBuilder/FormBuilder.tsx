import React from 'react';
import { Plus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Question, QuestionType, FormData } from '../types';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { QuestionItem } from './QuestionItem';

interface FormBuilderProps {
  formData: FormData;
  onChange: (formData: FormData) => void;
}

export function FormBuilder({ formData, onChange }: FormBuilderProps) {
  const [selectedType, setSelectedType] = React.useState<QuestionType>('shortAnswer');
  const questionsEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    questionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: selectedType,
      title: '',
      required: false,
      options: ['', ''],
    };

    onChange({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });

    setTimeout(scrollToBottom, 100);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    onChange({
      ...formData,
      questions: formData.questions.map(question =>
        question.id === questionId ? { ...question, ...updates } : question
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    onChange({
      ...formData,
      questions: formData.questions.filter(question => question.id !== questionId),
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const questions = Array.from(formData.questions);
    const [reorderedQuestion] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, reorderedQuestion);

    onChange({ ...formData, questions });
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 bg-white z-10 pb-4 shadow-sm">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3">Select Question Type</h3>
          <QuestionTypeSelector value={selectedType} onChange={setSelectedType} />
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {formData.questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="touch-manipulation"
                    >
                      <QuestionItem
                        question={question}
                        onUpdate={(updates) => updateQuestion(question.id, updates)}
                        onDelete={() => deleteQuestion(question.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={addQuestion}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        <Plus size={20} />
        Add Question
      </button>

      <div ref={questionsEndRef} />
    </div>
  );
}