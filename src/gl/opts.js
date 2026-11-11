// What the canvas is asked for.
//
// These are used twice: once to find out whether this machine can draw at all, before any of the canvas code is
// downloaded, and then again to make the real context. Both ask the same canvas for the same thing, so the browser
// hands back the very context that was tested — there is never a second one, and none is thrown away.
//
// Note what is not asked for: the high-performance card. On a laptop with two of them that can hand back a context
// the compositor never manages to show, which leaves the room empty rather than falling back to its picture. These
// scenes are a handful of shaders and the engine gives up pixels when it has to, so the fast card is not worth that.
export const GL_OPTS = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  // kept, so that a frame the engine chooses not to redraw cannot be dropped and leave the canvas blank
  preserveDrawingBuffer: true,
  // software rendering is never worth it: the page looks right without a canvas at all
  failIfMajorPerformanceCaveat: true,
}

// the names a renderer goes by when there is no real graphics chip behind it
export const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|microsoft basic/i
