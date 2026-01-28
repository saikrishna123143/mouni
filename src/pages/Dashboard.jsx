import React, { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- REDUCER ---------------- */
const initialState = { tasks: [] };

function reducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return { tasks: action.payload };
    case "ADD":
      return { tasks: [...state.tasks, action.payload] };
    case "UPDATE":
      return {
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE":
      return { tasks: state.tasks.filter(t => t.id !== action.id) };
    case "MOVE":
      return {
        tasks: state.tasks.map(t =>
          t.id === action.id ? { ...t, status: action.status } : t
        ),
      };
    default:
      return state;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState("");

  /* ---------------- LOAD & SAVE ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("dashboard_tasks");
    if (saved) {
      dispatch({ type: "LOAD", payload: JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard_tasks", JSON.stringify(state.tasks));
  }, [state.tasks]);

  /* ---------------- LOGOUT ---------------- */
  function logout() {
    localStorage.removeItem("jwt_token");
    navigate("/login", { replace: true });
  }

  /* ---------------- SAVE TASK ---------------- */
  function saveTask(task) {
    dispatch({
      type: editTask ? "UPDATE" : "ADD",
      payload: editTask
        ? task
        : { ...task, id: Date.now().toString(), status: "progress" },
    });
    setShowForm(false);
    setEditTask(null);
  }

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredTasks = state.tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (!category || t.category === category) &&
    (!priority || t.priority === priority) &&
    (!date || t.serviceDate === date)
  );

  const progressCount = filteredTasks.filter(t => t.status === "progress").length;
  const doneCount = filteredTasks.filter(t => t.status === "done").length;
  const categories = [...new Set(state.tasks.map(t => t.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* ---------------- TOP BAR ---------------- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
            U
          </div>
          <span className="text-sm font-medium">User</span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ---------------- SEARCH & FILTERS ---------------- */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          placeholder="Search task..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Priority</option>
          <option>High</option>
          <option>Low</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* ---------------- COLUMNS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Column title="To Do" onAdd={() => setShowForm(true)}>
          {filteredTasks.map(t => (
            <TaskCard key={t.id} task={t} dispatch={dispatch} onEdit={setEditTask} />
          ))}
        </Column>

        <Column title="On Progress" count={progressCount}>
          {filteredTasks.filter(t => t.status === "progress").map(t => (
            <TaskCard key={t.id} task={t} dispatch={dispatch} onEdit={setEditTask} />
          ))}
        </Column>

        <Column title="Done" count={doneCount}>
          {filteredTasks.filter(t => t.status === "done").map(t => (
            <TaskCard key={t.id} task={t} dispatch={dispatch} onEdit={setEditTask} />
          ))}
        </Column>

      </div>

      {showForm && (
        <TaskForm
          initialData={editTask}
          onClose={() => {
            setShowForm(false);
            setEditTask(null);
          }}
          onSave={saveTask}
        />
      )}
    </div>
  );
}

/* ---------------- COLUMN ---------------- */
function Column({ title, count, onAdd, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm">{title}</h2>
          {count !== undefined && (
            <span className="text-xs bg-slate-100 px-2 rounded-full">
              {count}
            </span>
          )}
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-7 h-7 bg-indigo-600 text-white rounded flex items-center justify-center"
          >
            +
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* ---------------- TASK CARD ---------------- */
function TaskCard({ task, dispatch, onEdit }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative bg-white border rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-2 right-2 text-gray-400"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-2 top-8 bg-white border rounded shadow z-10">
          <button
            onClick={() => onEdit(task)}
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={() => dispatch({ type: "DELETE", id: task.id })}
            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}

      {task.image && (
        <img src={task.image} alt="" className="w-full h-28 object-cover" />
      )}

      <div className="p-3">
        <div className="flex gap-1 mb-1">
          <span className="text-xs bg-orange-100 px-2 rounded">
            {task.priority}
          </span>
          <span className="text-xs bg-slate-100 px-2 rounded">
            {task.category}
          </span>
        </div>

        <h3 className="text-sm font-semibold">{task.title}</h3>
        <p className="text-xs text-gray-500">{task.description}</p>
        <p className="text-xs text-gray-400 mt-1">📅 {task.serviceDate}</p>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => dispatch({ type: "MOVE", id: task.id, status: "progress" })}
            className="flex-1 text-xs bg-orange-100 rounded py-1"
          >
            Progress
          </button>
          <button
            onClick={() => dispatch({ type: "MOVE", id: task.id, status: "done" })}
            className="flex-1 text-xs bg-green-100 rounded py-1"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- TASK FORM ---------------- */
function TaskForm({ initialData, onClose, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      title: "",
      description: "",
      priority: "Low",
      category: "",
      serviceDate: "",
      image: "",
    }
  );

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-96 p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-4">
          {initialData ? "Edit Task" : "Add Task"}
        </h2>

        <input className="w-full border p-2 mb-2" placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <textarea className="w-full border p-2 mb-2" rows="3"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <select className="w-full border p-2 mb-2"
          value={form.priority}
          onChange={e => setForm({ ...form, priority: e.target.value })}
        >
          <option>Low</option>
          <option>High</option>
        </select>

        <input className="w-full border p-2 mb-2"
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />

        <input type="date" className="w-full border p-2 mb-2"
          value={form.serviceDate}
          onChange={e => setForm({ ...form, serviceDate: e.target.value })}
        />

        <input type="file" onChange={handleImage} className="mb-3" />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-500">Cancel</button>
          <button
            onClick={() => onSave(form)}
            className="bg-indigo-600 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
