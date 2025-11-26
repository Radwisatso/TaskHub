"use client";

import { useState, useEffect } from "react";
import { taskAPI } from "@/services/api";
import { Task } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"To Do" | "In Progress" | "Done">(
    "To Do"
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      // For now, use mock data if API fails
      setTasks([
        {
          id: "1",
          title: "Sample Task 1",
          status: "To Do",
          userId: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Sample Task 2",
          status: "In Progress",
          userId: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Sample Task 3",
          status: "Done",
          userId: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskAPI.updateTask(editingTask.id, { title, status });
      } else {
        await taskAPI.createTask({ title, status });
      }
      await fetchTasks();
      closeModal();
    } catch (error) {
      console.error("Failed to save task:", error);
      // For now, add task locally if API fails
      if (!editingTask) {
        const newTask: Task = {
          id: Date.now().toString(),
          title,
          status,
          userId: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTasks([...tasks, newTask]);
        closeModal();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await taskAPI.deleteTask(id);
        await fetchTasks();
      } catch (error) {
        console.error("Failed to delete task:", error);
        // Delete locally if API fails
        setTasks(tasks.filter((task) => task.id !== id));
      }
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setStatus(task.status);
    } else {
      setEditingTask(null);
      setTitle("");
      setStatus("To Do");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setTitle("");
    setStatus("To Do");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">TaskHub</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">My Tasks</h2>
            <button
              onClick={() => openModal()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
            >
              + Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["To Do", "In Progress", "Done"].map((statusColumn) => (
              <div key={statusColumn} className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {statusColumn}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {
                      tasks.filter((task) => task.status === statusColumn)
                        .length
                    }{" "}
                    tasks
                  </p>
                </div>
                <div className="p-4 space-y-3 min-h-[400px]">
                  {tasks
                    .filter((task) => task.status === statusColumn)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-medium text-gray-900 mb-3">
                          {task.title}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(task)}
                            className="flex-1 text-sm text-blue-600 hover:text-blue-800 font-medium py-1 px-3 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="flex-1 text-sm text-red-600 hover:text-red-800 font-medium py-1 px-3 border border-red-300 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  {tasks.filter((task) => task.status === statusColumn)
                    .length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No tasks yet
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              {editingTask ? "Edit Task" : "Add New Task"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md"
                >
                  {editingTask ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
