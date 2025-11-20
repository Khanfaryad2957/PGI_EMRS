import { useState, useEffect } from 'react';
import { useGetClinicalOptionsQuery, useAddClinicalOptionMutation, useDeleteClinicalOptionMutation } from '../features/clinical/clinicalApiSlice';
import { FiX, FiSave, FiPlus, FiHeart, FiActivity, FiUser, FiClipboard, FiList, FiCheckSquare, FiFileText } from 'react-icons/fi';
import Input from './Input';
import Button from './Button';

export const CheckboxGroup = ({ label, name, value = [], onChange, options = [], rightInlineExtra = null }) => {
    const [localOptions, setLocalOptions] = useState(options);
    const [showAdd, setShowAdd] = useState(false);
    const [customOption, setCustomOption] = useState('');
    const { data: remoteOptions } = useGetClinicalOptionsQuery(name);
    const [addOption] = useAddClinicalOptionMutation();
    const [deleteOption] = useDeleteClinicalOptionMutation();
  
    const iconByGroup = {
      mood: <FiHeart className="w-6 h-6 text-rose-600" />,
      behaviour: <FiActivity className="w-6 h-6 text-violet-600" />,
      speech: <FiUser className="w-6 h-6 text-sky-600" />,
      thought: <FiClipboard className="w-6 h-6 text-indigo-600" />,
      perception: <FiList className="w-6 h-6 text-cyan-600" />,
      somatic: <FiActivity className="w-6 h-6 text-emerald-600" />,
      bio_functions: <FiCheckSquare className="w-6 h-6 text-emerald-600" />,
      adjustment: <FiList className="w-6 h-6 text-amber-600" />,
      cognitive_function: <FiActivity className="w-6 h-6 text-fuchsia-600" />,
      fits: <FiActivity className="w-6 h-6 text-red-600" />,
      sexual_problem: <FiHeart className="w-6 h-6 text-pink-600" />,
      substance_use: <FiList className="w-6 h-6 text-teal-600" />,
      associated_medical_surgical: <FiFileText className="w-6 h-6 text-indigo-600" />,
      mse_behaviour: <FiActivity className="w-6 h-6 text-violet-600" />,
      mse_affect: <FiHeart className="w-6 h-6 text-rose-600" />,
      mse_thought: <FiClipboard className="w-6 h-6 text-indigo-600" />,
      mse_perception: <FiList className="w-6 h-6 text-cyan-600" />,
      mse_cognitive_function: <FiActivity className="w-6 h-6 text-fuchsia-600" />,
    };
  
    useEffect(() => {
      setLocalOptions(Array.from(new Set([...(remoteOptions || []), ...(options || [])])));
    }, [remoteOptions, options]);
  
    const toggle = (opt) => {
      const exists = value.includes(opt);
      const next = exists ? value.filter(v => v !== opt) : [...value, opt];
      onChange({ target: { name, value: next } });
    };
  
    const handleDelete = (opt) => {
      setLocalOptions((prev) => prev.filter((o) => o !== opt));
      if (value.includes(opt)) {
        const next = value.filter((v) => v !== opt);
        onChange({ target: { name, value: next } });
      }
      deleteOption({ group: name, label: opt }).catch(() => { });
    };
  
    const handleAddClick = () => setShowAdd(true);
    const handleCancelAdd = () => {
      setShowAdd(false);
      setCustomOption('');
    };
  
    const handleSaveAdd = () => {
      const opt = customOption.trim();
      if (!opt) {
        setShowAdd(false);
        return;
      }
      setLocalOptions((prev) => (prev.includes(opt) ? prev : [...prev, opt]));
      const next = value.includes(opt) ? value : [...value, opt];
      onChange({ target: { name, value: next } });
      setCustomOption('');
      setShowAdd(false);
      addOption({ group: name, label: opt }).catch(() => { });
    };
  
    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center gap-3 text-base font-semibold text-gray-800">
            <span>{iconByGroup[name] || <FiList className="w-6 h-6 text-gray-500" />}</span>
            <span>{label}</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {localOptions?.map((opt) => (
            <div key={opt} className="relative inline-flex items-center group">
              <button
                type="button"
                onClick={() => handleDelete(opt)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-red-600"
                aria-label={`Remove ${opt}`}
              >
                <FiX className="w-3 h-3" />
              </button>
              <label
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors duration-150 cursor-pointer
                  ${value.includes(opt)
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <span>{opt}</span>
              </label>
            </div>
          ))}
          {rightInlineExtra && (
            <div className="inline-flex items-center">
              {rightInlineExtra}
            </div>
          )}
          <div className="flex items-center gap-2">
            {showAdd && (
              <Input
                placeholder="Enter option name"
                value={customOption}
                onChange={(e) => setCustomOption(e.target.value)}
                className="max-w-xs"
              />
            )}
            {showAdd ? (
              <>
                <Button
                  type="button"
                  onClick={handleCancelAdd}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40"
                >
                  <FiX className="w-4 h-4" /> Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAdd}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40"
                >
                  <FiSave className="w-4 h-4" /> Save
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={handleAddClick}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40"
              >
                <FiPlus className="w-4 h-4" /> Add
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };