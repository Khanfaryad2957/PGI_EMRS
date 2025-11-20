import { useState, useEffect } from 'react';
import Select from './Select';
import icd11Codes from '../assets/ICD11_Codes.json';

export const ICD11CodeSelector = ({ value, onChange, error }) => {
    const [selectedPath, setSelectedPath] = useState([]);
    const [selectedCode, setSelectedCode] = useState(value || '');
  
    const getChildren = (levelIndex, parentItem) => {
      if (levelIndex === 0) {
        return icd11Codes.filter(item => item.level === 0);
      }
      if (!parentItem && levelIndex > 0) return [];
      const level = levelIndex;
      return icd11Codes.filter(item => {
        if (item.level !== level) return false;
        if (level === 1) {
          const level0Code = selectedPath[0]?.code || '';
          return item.parent_code === level0Code;
        } else if (level === 2) {
          const level0Code = selectedPath[0]?.code || '';
          const level1Item = selectedPath[1];
          const level1Code = level1Item?.code || '';
          if (level1Code && item.parent_code === level1Code) return true;
          if (item.parent_code === level0Code) return true;
          if (item.parent_code === '' && level0Code && item.code) {
            if (level0Code === '06' && item.code.startsWith('6')) return true;
            if (item.code.startsWith(level0Code)) return true;
          }
          return false;
        } else {
          const prevLevelItem = selectedPath[levelIndex - 1];
          if (!prevLevelItem) return false;
          const prevLevelCode = prevLevelItem.code || '';
          return item.parent_code === prevLevelCode;
        }
      });
    };
  
    useEffect(() => {
      if (value && !selectedPath.length && value !== selectedCode) {
        const codeItem = icd11Codes.find(item => item.code === value);
        if (codeItem) {
          const path = [];
          let current = codeItem;
          while (current) {
            path.unshift(current);
            let parent = null;
            if (current.parent_code) {
              parent = icd11Codes.find(item => item.code === current.parent_code);
              if (!parent && current.level > 0) {
                if (current.level === 1) {
                  parent = icd11Codes.find(item => item.level === 0 && item.code === current.parent_code);
                } else if (current.level === 2) {
                  parent = icd11Codes.find(item =>
                    (item.level === 1 && item.parent_code === current.parent_code) ||
                    (item.level === 0 && item.code === current.parent_code)
                  );
                } else {
                  parent = icd11Codes.find(item => item.code === current.parent_code);
                }
              }
            }
            current = parent;
          }
          if (path.length > 0) {
            setSelectedPath(path);
            setSelectedCode(value);
          }
        }
      }
    }, [value]);
  
    useEffect(() => {
      if (value !== selectedCode) {
        setSelectedCode(value || '');
      }
    }, [value]);
  
    const handleLevelChange = (levelIndex, selectedItem) => {
      const newPath = selectedPath.slice(0, levelIndex);
      if (selectedItem) {
        newPath[levelIndex] = selectedItem;
      }
      setSelectedPath(newPath);
      let deepestCode = '';
      for (let i = newPath.length - 1; i >= 0; i--) {
        if (newPath[i]?.code) {
          deepestCode = newPath[i].code;
          break;
        }
      }
      setSelectedCode(deepestCode);
      onChange({ target: { name: 'icd_code', value: deepestCode } });
    };
  
    const renderDropdown = (levelIndex) => {
      const parentItem = levelIndex > 0 ? selectedPath[levelIndex - 1] : null;
      const children = getChildren(levelIndex, parentItem);
      if (children.length === 0 && levelIndex > 0) return null;
      const selectedItem = selectedPath[levelIndex];
      const labelText = levelIndex === 0 ? 'Category' :
        levelIndex === 1 ? 'Subcategory' :
          levelIndex === 2 ? 'Code Group' : 'Specific Code';
      return (
        <div key={levelIndex} className="flex-shrink-0 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {labelText}
          </label>
          <Select
            value={selectedItem ? JSON.stringify(selectedItem) : ''}
            onChange={(e) => {
              const item = e.target.value ? JSON.parse(e.target.value) : null;
              handleLevelChange(levelIndex, item);
            }}
            options={[
              { value: '', label: `Select ${labelText}` },
              ...children?.map(item => ({
                value: JSON.stringify(item),
                label: `${item.code || '(Category)'} - ${item.title}`
              }))
            ]}
            error={levelIndex === 0 && error}
          />
        </div>
      );
    };
  
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ICD Code
        </label>
        <div className="flex flex-wrap items-end gap-4">
          {renderDropdown(0)}
          {selectedPath[0] && renderDropdown(1)}
          {selectedPath[1] && renderDropdown(2)}
          {selectedPath[2] && selectedPath[2].has_children && renderDropdown(3)}
          {selectedPath[3] && selectedPath[3].has_children && renderDropdown(4)}
          {selectedPath[4] && selectedPath[4].has_children && renderDropdown(5)}
        </div>
        {selectedCode && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Selected ICD-11 Code:</strong> <span className="font-mono font-semibold">{selectedCode}</span>
              {selectedPath[selectedPath.length - 1] && (
                <span className="ml-2 text-blue-600">
                  - {selectedPath[selectedPath.length - 1].title}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    );
  };