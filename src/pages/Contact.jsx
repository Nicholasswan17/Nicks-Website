import './Pages.css'

export default function Contact() {
  return (
    <main className="page-content">
      <h2>How to Reach Us</h2>
      <p>
        The Dachshund Dynasty has two locations worldwide. We have offices in Goulburn,
        Australia and Albuquerque New Mexico, United States. If you have any questions or
        enquiries please feel free to contact us. If you are ever in the area, feel free
        to come in and say hello.
      </p>
      <div className="contact-container">
        <img src="/Bruno1.jpg" alt="Photo of Bruno the dog" className="contact-img" />
        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Australia</strong></td>
              <td>0404-012-808</td>
              <td>Maud St, Goulburn NSW 2580</td>
            </tr>
            <tr>
              <td><strong>America</strong></td>
              <td>(505)503-4455</td>
              <td>308 Negra Arroyo Lane ABQ NM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  )
}