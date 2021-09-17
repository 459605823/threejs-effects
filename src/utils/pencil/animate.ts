let req: number;

export default function animate(update: (time: number) => void, t = 0) {
  update(t);
  req = window.requestAnimationFrame(animate.bind(null, update));
}

export const cancel = () => {
  if (req) {
    window.cancelAnimationFrame(req);
  }
};
