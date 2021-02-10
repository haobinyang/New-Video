export function plunging({
  startTime,
  endTime,
  currentTime,
  easeType,
  width,
  height
}) {
  const progress = (currentTime - startTime) / (endTime - startTime) * 100;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <div style="display: flex; align-items: stretch; width: ${width}px; height: ${height}px; clip-path: inset(${progress}% 0 0 0)">
            <div style="flex-basis: 33.33333333333333%; background: rgba(255, 255, 255, 1); clip-path: inset(0 0 0% 0)">
              <div style="width: 100%; height: 100%; background: rgba(102, 93, 195, 1)"></div>
            </div>
            <div style="flex-basis: 33.33333333333333%; background: rgba(255, 255, 255, 1); clip-path: inset(0 0 0% 0)">
              <div style="width: 100%; height: 100%; background: rgba(102, 93, 195, 1)"></div>
            </div>
            <div style="flex-basis: 33.33333333333333%; background: rgba(255, 255, 255, 1); clip-path: inset(0 0 0% 0)">
              <div style="width: 100%; height: 100%; background: rgba(102, 93, 195, 1)"></div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  `;
}