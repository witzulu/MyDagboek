import React from 'react';
import { SlidersHorizontal, SortAsc, X } from 'lucide-react';

const FilterBar = ({
  members,
  labels,
  priorities,
  filters,
  onFilterChange,
  sortOptions,
  sortConfig,
  onSortChange,
  onClear,
}) => {
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="p-4 bg-base-200 rounded-lg mb-4 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <SlidersHorizontal size={20} />
        <span>Filters</span>
      </div>

      {/* Assignee Filter */}
      <select
        name="assignee"
        value={filters.assignee || ''}
        onChange={handleSelectChange}
        className="select select-bordered select-sm w-full max-w-xs"
      >
        <option value="">Filter by Assignee</option>
        {members.map((member) => (
          <option key={member.user._id} value={member.user._id}>
            {member.user.name}
          </option>
        ))}
      </select>

      {/* Label Filter */}
      <select
        name="label"
        value={filters.label || ''}
        onChange={handleSelectChange}
        className="select select-bordered select-sm w-full max-w-xs"
      >
        <option value="">Filter by Label</option>
        {labels.map((label) => (
          <option key={label._id} value={label._id}>
            {label.name}
          </option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        name="priority"
        value={filters.priority || ''}
        onChange={handleSelectChange}
        className="select select-bordered select-sm w-full max-w-xs"
      >
        <option value="">Filter by Priority</option>
        {priorities.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

      <div className="flex-grow"></div>

      <div className="flex items-center gap-2">
        <SortAsc size={20} />
        <select
          name="sort"
          value={sortConfig.key}
          onChange={(e) => onSortChange(e.target.value)}
          className="select select-bordered select-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>
      </div>


      <button onClick={onClear} className="btn btn-sm btn-ghost">
        <X size={16} className="mr-1" />
        Clear All
      </button>
    </div>
  );
};

export default FilterBar;
