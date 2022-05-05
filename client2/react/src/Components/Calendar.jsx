export default function Calendar (props) {
  return <div style={{padding: '10px', paddingLeft: '0'}}>
  <iframe 
  src="https://calendar.google.com/calendar/embed?src=5ck6mdv5ll704naseq8rsdbp34%40group.calendar.google.com&ctz=America%2FSao_Paulo"
  style={{border: 'dashed 1px #777', borderRadius: '2.5%'}} 
  width="100%"
  height="300vh" 
  frameBorder="0" 
  scrolling="no"/>
  </div>
}