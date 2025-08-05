const { ValidationError } = require('./errorHandler');

// Validation middleware
const validateTestCase = (req, res, next) => {
  const { title, test_steps, expected_result, priority, execution_type, importance } = req.body;
  const errors = {};

  // Required fields
  if (!title || title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (title.length > 255) {
    errors.title = 'Title must be 255 characters or less';
  }

  if (!test_steps || test_steps.trim().length === 0) {
    errors.test_steps = 'Test steps are required';
  }

  if (!expected_result || expected_result.trim().length === 0) {
    errors.expected_result = 'Expected result is required';
  }

  // Optional field validations
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    errors.priority = 'Priority must be low, medium, or high';
  }

  if (execution_type && ![1, 2].includes(execution_type)) {
    errors.execution_type = 'Execution type must be 1 (Manual) or 2 (Automated)';
  }

  if (importance && ![1, 2, 3].includes(importance)) {
    errors.importance = 'Importance must be 1 (Low), 2 (Medium), or 3 (High)';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  next();
};

const validateProject = (req, res, next) => {
  const { name, status } = req.body;
  const errors = {};

  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (name.length > 255) {
    errors.name = 'Name must be 255 characters or less';
  }

  if (status && !['active', 'inactive'].includes(status)) {
    errors.status = 'Status must be active or inactive';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  next();
};

const validateTestSuite = (req, res, next) => {
  const { project_id, name } = req.body;
  const errors = {};

  if (!project_id || !Number.isInteger(Number(project_id))) {
    errors.project_id = 'Valid project ID is required';
  }

  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (name.length > 255) {
    errors.name = 'Name must be 255 characters or less';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  next();
};

const validatePagination = (req, res, next) => {
  const { limit, offset } = req.query;
  
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      throw new ValidationError('Invalid limit parameter', {
        limit: 'Limit must be a number between 1 and 1000'
      });
    }
    req.query.limit = limitNum;
  }

  if (offset) {
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      throw new ValidationError('Invalid offset parameter', {
        offset: 'Offset must be a non-negative number'
      });
    }
    req.query.offset = offsetNum;
  }

  next();
};

module.exports = {
  validateTestCase,
  validateProject,
  validateTestSuite,
  validatePagination
};