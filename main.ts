function filepathFromURL(path: string) : string {
  const path_elements = path.split("/");
  let file_path = ".";
  for (let i = 1;i < path_elements.length;i++) {
    file_path += "/";
    file_path += path_elements[i];
  }
  if (file_path[file_path.length - 1] == "/") {
    file_path += "index.html";
  }
  return file_path;
}

async function generateResponse(req: Request) {
  const page404 = await Deno.readFile("404.html");
  const response404Options = {status: 404};
  const response404 = new Response(page404, response404Options);

  if (req.method == "GET") {
    const url = new URL(req.url);
    const filepath = filepathFromURL(url.pathname);
    try {
      const page = await Deno.readFile(filepath);
      const responseOptions = {status: 200};
      const response = new Response(page, responseOptions);
      return response;
    }
    catch (e) {
      console.log(e);
      return response404;
    }
  }
  else {
    ;
  }

  return response404;
}

if (import.meta.main) {
  Deno.serve(generateResponse);
}
