$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server running at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        
        # Handle directory-style URLs: /projects/ -> /projects/index.html
        if ($path -match '/$' -and $path -ne '/') {
            $path = $path + 'index.html'
        }
        
        $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            $contentType = 'text/html'
            
            switch ($ext) {
                '.css' { $contentType = 'text/css' }
                '.js' { $contentType = 'application/javascript' }
                '.json' { $contentType = 'application/json' }
                '.pdf' { $contentType = 'application/pdf' }
                '.jpg' { $contentType = 'image/jpeg' }
                '.jpeg' { $contentType = 'image/jpeg' }
                '.png' { $contentType = 'image/png' }
                '.gif' { $contentType = 'image/gif' }
                '.svg' { $contentType = 'image/svg+xml' }
            }
            
            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $response.ContentType = 'text/html'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes('<h1>404 Not Found</h1>')
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        
        $response.OutputStream.Close()
    } catch {
        Write-Host "Error: $_"
    }
}

$listener.Close()
