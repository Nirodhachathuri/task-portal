'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import './tasks.css';

type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

type User = {
  name: string;
  email: string;
};

const statusLabel: Record<Status, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [editing, setEditing] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);

  /**
   * Load current user and tasks
   */
  async function load() {
    try {
      setLoading(true);

      const [meResponse, taskResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/tasks'),
      ]);

      if (
        meResponse.status === 401 ||
        taskResponse.status === 401
      ) {
        router.replace('/login');
        return;
      }

      if (!meResponse.ok || !taskResponse.ok) {
        setError('Unable to load your tasks.');
        return;
      }

      const meData = await meResponse.json();
      const taskData = await taskResponse.json();

      setUser(meData.user);
      setTasks(taskData.tasks ?? []);
    } catch {
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /**
   * Reset create/edit form
   */
  function resetForm() {
    setTitle('');
    setDescription('');
    setEditing(null);
    setError('');
    setShowForm(false);
  }

  /**
   * Open create form
   */
  function openCreateForm() {
    setTitle('');
    setDescription('');
    setEditing(null);
    setError('');
    setShowForm(true);
  }

  /**
   * Open edit form
   */
  function openEditForm(task: Task) {
    setEditing(task);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setError('');
    setShowForm(true);
  }

  /**
   * Create / update task
   */
  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setSaving(true);
    setError('');

    const url = editing
      ? `/api/tasks/${editing.id}`
      : '/api/tasks';

    const method = editing ? 'PATCH' : 'POST';

    const body = editing
      ? {
          title: title.trim(),
          description: description.trim(),
          status: editing.status,
        }
      : {
          title: title.trim(),
          description: description.trim(),
        };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? 'Could not save task.'
        );
        return;
      }

      resetForm();
      await load();
    } catch {
      setError('Unable to save task.');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Change task status
   */
  async function changeStatus(
    task: Task,
    status: Status
  ) {
    try {
      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description ?? '',
            status,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        setError(
          data.error ?? 'Could not update task status.'
        );

        return;
      }

      await load();
    } catch {
      setError('Unable to update task status.');
    }
  }

  /**
   * Delete task
   */
  async function removeTask(id: string) {
    const confirmed = window.confirm(
      'Delete this task?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/tasks/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();

        setError(
          data.error ?? 'Could not delete task.'
        );

        return;
      }

      await load();
    } catch {
      setError('Unable to delete task.');
    }
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  /**
   * Loading state
   */
  if (loading) {
    return (
      <main className="tasks-loading">
        <div className="loading-spinner" />
        <p>Loading tasks...</p>
      </main>
    );
  }

  return (
    <main className="tasks-page">

      {/* ================= HEADER ================= */}

      <header className="tasks-header">
        <div className="tasks-header-inner">

          <div className="tasks-brand">
            <p>Task management dashboard</p>
          </div>

          <div className="tasks-header-actions">

            <div className="user-info">
              <span className="user-name">
                {user?.name}
              </span>

              <span className="user-email">
                {user?.email}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="logout-button"
            >
              Log out
            </button>

          </div>

        </div>
      </header>

      {/* ================= MAIN ================= */}

      <div className="tasks-container">

        {/* Page heading */}

        <div className="tasks-page-header">

          <div>
            <h2>My tasks</h2>

            <p>
              Create, update and manage your tasks.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="add-task-button"
          >
            + Add task
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* ================= CREATE / EDIT FORM ================= */}

        {showForm && (
          <section className="task-form-card">

            <div className="task-form-header">
              <h3>
                {editing
                  ? 'Edit task'
                  : 'New task'}
              </h3>

              <p>
                {editing
                  ? 'Update your task details.'
                  : 'Create a new task.'}
              </p>
            </div>

            <form
              onSubmit={saveTask}
              className="task-form"
            >

              {/* Title */}

              <div className="form-group">

                <label htmlFor="title">
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Prepare project report"
                  autoFocus
                />

              </div>

              {/* Description */}

              <div className="form-group">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Add task details..."
                />

              </div>

              {/* Form buttons */}

              <div className="form-actions">

                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-button"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="save-button"
                >
                  {saving
                    ? 'Saving...'
                    : editing
                      ? 'Update task'
                      : 'Create task'}
                </button>

              </div>

            </form>

          </section>
        )}

        {/* ================= TASK TABLE ================= */}

        <section className="task-table-card">

          <div className="task-table-header">

            <div>
              <h3>Task list</h3>

              <span>
                {tasks.length}{' '}
                {tasks.length === 1
                  ? 'task'
                  : 'tasks'}
              </span>
            </div>

            {!showForm && (
              <button
                type="button"
                onClick={openCreateForm}
                className="table-add-button"
              >
                + Add task
              </button>
            )}

          </div>

          {/* Empty state */}

          {tasks.length === 0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h4>
                No tasks yet
              </h4>

              <p>
                Create your first task to get started.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="empty-add-button"
              >
                Create your first task
              </button>

            </div>
          ) : (

            /* Table */

            <div className="table-wrapper">

              <table className="tasks-table">

                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {tasks.map((task) => (
                    <tr key={task.id}>

                      {/* Task */}

                      <td className="task-details">

                        <strong>
                          {task.title}
                        </strong>

                        {task.description && (
                          <p>
                            {task.description}
                          </p>
                        )}

                      </td>

                      {/* Status */}

                      <td>

                        <select
                          value={task.status}
                          onChange={(event) =>
                            changeStatus(
                              task,
                              event.target.value as Status
                            )
                          }
                          className={`status-select status-${task.status.toLowerCase()}`}
                        >
                          <option value="TODO">
                            {statusLabel.TODO}
                          </option>

                          <option value="IN_PROGRESS">
                            {statusLabel.IN_PROGRESS}
                          </option>

                          <option value="DONE">
                            {statusLabel.DONE}
                          </option>
                        </select>

                      </td>

                      {/* Created */}

                      <td className="date-cell">
                        {new Date(
                          task.createdAt
                        ).toLocaleDateString()}
                      </td>

                      {/* Updated */}

                      <td className="date-cell">
                        {new Date(
                          task.updatedAt
                        ).toLocaleDateString()}
                      </td>

                      {/* Actions */}

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(task)
                            }
                            className="edit-button"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeTask(task.id)
                            }
                            className="delete-button"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}