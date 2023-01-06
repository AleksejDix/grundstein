const options = { year: 'numeric', month: 'short', day: 'numeric' };
const dateFormatter = new Intl.DateTimeFormat('de-De', options)

export const formatDate = (d: Date) => dateFormatter.format(d)