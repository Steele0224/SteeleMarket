export function getCookie(request) {
    return request.headers.get("Cookie")
  }
  