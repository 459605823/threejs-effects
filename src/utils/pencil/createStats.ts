import Stats from 'stats.js';

export default (): Stats => {
  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = 'absolute';
  return stats;
};
