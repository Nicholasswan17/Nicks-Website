import './Pages.css'

export default function General() {
  return (
    <main className="page-content">
      <h2>Types of Dachshunds</h2>
      <p>
        Dachshunds come in all different shapes and sizes and there are two attributes that
        vary across all sausage dogs. These include the size and the coat type of each Dachshund.
      </p>
      <div className="types-img-block">
        <img src="/Types.jpg" alt="Three types of Dachshunds" className="types-img" />
        <blockquote>Source: Alpha Paw, April 2022</blockquote>
      </div>
      <p>These differences include:</p>
      <dl>
        <dt><strong>Size</strong></dt>
        <dd>Standard</dd>
        <dd>Miniature</dd>
        <br />
        <dt><strong>Hair Type</strong></dt>
        <dd>Smooth</dd>
        <dd>Wired</dd>
        <dd>Long</dd>
      </dl>
      <div className="clearfix"></div>

      <h2>Dennis' Weight-loss Journey</h2>
      <div className="dennis-img-block">
        <img src="/DennistheDog.PNG" alt="Dennis the overweight Dachshund" className="dennis-img" />
        <blockquote>Source: Rose Troup Buchanan, The Independent, March 2015</blockquote>
      </div>
      <p>
        Dennis' old owner was abusive and overfed him. But new owner Brooke Burton was nurturing
        and encouraged him to lose weight. After starting a strict diet and exercise routine,
        Dennis was able to lose 75% of his body weight and become a happy and healthy wiener.
        This shows how critical it is to help your dog maintain its weight and not fall into
        obesity like our old friend Dennis.
      </p>
      <div className="clearfix"></div>
    </main>
  )
}