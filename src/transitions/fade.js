export function fade() {
  return {
    uniforms: {},
    fragment: `
      vec4 transition(vec2 uv) {
        return mix(
          getFromColor(uv),
          getToColor(uv),
          progress
        );
      }
    `
  };
}