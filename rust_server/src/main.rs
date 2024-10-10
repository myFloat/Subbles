use hyper::{Body, Request, Response, Server, StatusCode};
use hyper::service::{make_service_fn, service_fn};
use std::{convert::Infallible, fs};
use std::path::PathBuf;


#[tokio::main]
async fn main() {
    // Define the address for the server
    let addr = ([192, 168, 68, 104], 8080).into();
    let make_svc = make_service_fn(|_conn| async { Ok::<_, Infallible>(service_fn(handle_request)) });

    // Create the server
    let server = Server::bind(&addr).serve(make_svc);

    println!("Server running at http://{}", addr);

    // Run the server
    if let Err(e) = server.await {
        eprintln!("Server error: {}", e);
    }
}

async fn handle_request(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    // Get the requested path, stripping the leading slash
    let path = req.uri().path().trim_start_matches('/');
    
    // Build the file path, starting from the parent directory (my_project)
    let mut file_path = PathBuf::from("../"); // Go up to the parent directory
    if path.is_empty() {
        file_path.push("index.html"); // Serve index.html if root is requested
    } else {
        file_path.push(path); // Otherwise, append the requested path
    }

    // Attempt to read the requested file
    match fs::read(&file_path) {
        Ok(content) => {
            // Determine content type based on the file extension
            let content_type = if let Some(ext) = file_path.extension().and_then(|s| s.to_str()) {
                match ext {
                    "html" => "text/html",
                    "css" => "text/css",
                    "js" => "application/javascript",
                    "ico" => "image/x-icon",
                    _ => "application/octet-stream", // Fallback for unknown types
                }
            } else {
                "application/octet-stream" // Fallback if no extension
            };

            // Create and return a response with the correct content type
            let response = Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", content_type)
                .body(Body::from(content))
                .unwrap();
            Ok(response)
        }
        Err(_) => {
            // Return 404 Not Found if the file doesn't exist
            let response = Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from("404 Not Found"))
                .unwrap();
            Ok(response)
        }
    }
}