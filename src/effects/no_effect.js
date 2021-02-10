export function noEffect() {
  return {
    uniforms: {},
    fragment: (texName = 'tex', funName = 'effect') => `
      vec4 ${funName}(vec2 uv) {
        return texture2D(${texName}, uv);
      }
    `
  };
}