#!/bin/bash

# Resume Template Development Server
# Automatically starts a local HTTP server and opens the resume in your browser
lsof -i :8000
pkill -f "python.*http.server.*8000"
echo "🚀 Starting Resume Template Development Server..."
echo "📁 Serving files from: $(pwd)"
echo "🌐 Server will run at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    echo "🔄 Generating resume templates..."
    python3 ./scripts/generate-resumes.py
    echo "🎨 Generating theme styles..."
    python3 ./scripts/generate-themes.py
    echo "✅ Using Python 3 HTTP server"
    # Start the server in background and open browser
    python3 -m http.server 8000 &
    SERVER_PID=$!

    # Wait a moment for server to start
    sleep 2

    # Try to open in browser (works on macOS, Linux, and Windows)
    if command -v open &>/dev/null; then
        echo "🌐 Opening in browser..."
        open http://localhost:8000/resume-dynamic.html
    elif command -v xdg-open &>/dev/null; then
        echo "🌐 Opening in browser..."
        xdg-open http://localhost:8000/resume-dynamic.html
    elif command -v start &>/dev/null; then
        echo "🌐 Opening in browser..."
        start http://localhost:8000/resume-dynamic.html
    else
        echo "📋 Please open: http://localhost:8000/resume-dynamic.html"
    fi

    # Wait for server process
    wait $SERVER_PID

elif command -v python &>/dev/null; then
    echo "✅ Using Python 2 HTTP server"
    python -m SimpleHTTPServer 8000 &
    SERVER_PID=$!

    sleep 2

    if command -v open &>/dev/null; then
        open http://localhost:8000/resume-dynamic.html
    elif command -v xdg-open &>/dev/null; then
        xdg-open http://localhost:8000/resume-dynamic.html
    elif command -v start &>/dev/null; then
        start http://localhost:8000/resume-dynamic.html
    else
        echo "📋 Please open: http://localhost:8000/resume-dynamic.html"
    fi

    wait $SERVER_PID
else
    echo "❌ Python not found. Please install Python or use an alternative method:"
    echo ""
    echo "Alternative methods:"
    echo "1. Install Node.js and run: npx http-server -p 8000"
    echo "2. Install Node.js and run: npx serve -p 8000"
    echo "3. Use VS Code Live Server extension"
    echo "4. Use any other static file server"
    echo ""
    echo "Then open: http://localhost:8000/resume-dynamic.html"
fi
