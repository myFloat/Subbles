use hyper::{Body, Request, Response, Server, StatusCode};
use hyper::service::{make_service_fn, service_fn};
use std::{convert::Infallible, fs};

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
    // Serve the index.html file
    if req.uri() == "/" {
        match fs::read_to_string("index.html") {
            Ok(content) => {
                Ok(Response::new(Body::from(content)))
            }
            Err(_) => {
                Ok(Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(Body::from("Error reading file"))
                    .unwrap())
            }
        }
    } else {
        Ok(Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Body::from("404 Not Found"))
            .unwrap())
    }
}