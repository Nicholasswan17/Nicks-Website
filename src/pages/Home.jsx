import './Pages.css'

export default function Home() {
  return (
    <main className="page-content">
      <h2>About Us</h2>
      <div className="intro-container">
        <img src="/Dog1.png" alt="Photo of my dog Bruno" className="intro-img" />
        <p>
          Hello, my name is Bruno the sausage dog, and I am the owner of the Dachshund Dynasty.
          We are the leading Dachshund information centre in the world. I will be sharing with you
          everything I know about Dachshunds. You could say I am an expert in this field. Us
          Dachshunds come in all shapes and sizes. And did you know Dachshunds are the smallest
          breed in the hunting category? Anyways, I am feeling really hungry right now so I will
          leave you to explore the Dachshund Dynasty alone while I go eat my dinner.
        </p>
      </div>

      <h2>Dachshunds as Pets</h2>
      <p>
        Dachshunds are a very popular breed of dog. What attributes in Dachshunds are found to be
        more desirable than other breeds? To understand why Dachshunds are so popular we must
        examine the characteristics of them.
      </p>
      <img src="/HappyBruno.jpg" alt="Bruno the dog" className="facts-img" />

      <p>Some facts about Dachshunds include:</p>
      <ul>
        <li>Life expectancy of 12 to 16 years</li>
        <li>Difficult to discipline</li>
        <li>Prone to diabetes, epilepsy, and disc disease</li>
        <li>Energetic and lovable breed</li>
      </ul>
      <p>The top 4 benefits of owning a Dachshund include:</p>
      <ol>
        <li>Will deter potential home invaders</li>
        <li>Behaves well around other dogs</li>
        <li>Low maintenance</li>
        <li>Best looking breed</li>
      </ol>
      <div className="clearfix"></div>
    </main>
  )
}