export function watchBootResources(onReady: (index: number) => void) {
  const hero = document.querySelector<HTMLImageElement>('.hero__art img');
  const tasks = [
    document.fonts.load('700 16px "Chakra Petch"'),
    document.fonts.load('900 16px "Orbitron"'),
    hero?.decode() ?? Promise.resolve(),
  ];
  tasks.forEach((task, index) => {
    void task.catch(() => {}).then(() => onReady(index));
  });
}
