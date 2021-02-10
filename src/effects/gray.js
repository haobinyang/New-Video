export function gray() {
  return {
    uniforms: {},
    fragment: (texName = 'tex', funName = 'effect') => `
      vec4 ${funName}(vec2 uv) {
        vec4 color = texture2D(${texName}, uv);
        float gray = (color.r+color.g+color.b)/3.;
        return vec4(gray,gray,gray,color.a);
      }
    `
  };
}