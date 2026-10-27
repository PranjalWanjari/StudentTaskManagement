
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const method = request.method;

  // Handle browser CORS preflight requests
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Get all tasks
  if (url.pathname === "/api/tasks" && method === "GET") {
    const keys = await TASKS.list();
    const tasks = [];

    for (const key of keys.keys) {
      const task = await TASKS.get(key.name, "json");
      if (task) tasks.push(task);
    }

    return jsonResponse(tasks);
  }

  // Add a new task
  if (url.pathname === "/api/tasks" && method === "POST") {
    const data = await request.json();

    if (!data.title || !data.title.trim()) {
      return jsonResponse(
        { error: "Task title is required" },
        400
      );
    }

    const task = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    await TASKS.put(task.id, JSON.stringify(task));

    return jsonResponse(task, 201);
  }

  // Update a task
  if (url.pathname.startsWith("/api/tasks/") && method === "PUT") {
    const id = url.pathname.split("/").pop();
    const existing = await TASKS.get(id, "json");

    if (!existing) {
      return jsonResponse(
        { error: "Task not found" },
        404
      );
    }

    const data = await request.json();

    const updatedTask = {
      ...existing,
      title: data.title ?? existing.title,
      completed: data.completed ?? existing.completed
    };

    await TASKS.put(id, JSON.stringify(updatedTask));

    return jsonResponse(updatedTask);
  }

  // Delete a task
  if (url.pathname.startsWith("/api/tasks/") && method === "DELETE") {
    const id = url.pathname.split("/").pop();
    const existing = await TASKS.get(id);

    if (!existing) {
      return jsonResponse(
        { error: "Task not found" },
        404
      );
    }

    await TASKS.delete(id);

    return jsonResponse({
      message: "Task deleted successfully"
    });
  }

  return jsonResponse({
    message: "Student Task Management API is running!"
  });
}
