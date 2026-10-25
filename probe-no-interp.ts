export const x = [
  command: 'printf "{\\"id\\": 42, \\"name\\": \\"ada\\"}\\n" > ~/people.json; cat ~/people.json; grep -o "name[^,]*" ~/people.json',
];
