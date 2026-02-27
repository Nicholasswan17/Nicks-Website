import './Pages.css'

export default function History() {
  return (
    <main className="page-content">
      <h2>Origin of the Dachshund</h2>
      <p>
        The Dachshund was bred in Germany and the word Dachshund means "Badger Dog". Therefore,
        Dachshunds were used to hunt badgers and other small prey like hares and ferrets.
        Dachshunds are able to dig and enter burrows easily, so it makes them a perfect breed
        for hunting small animals. Dachshunds are still used for hunting around the world, so
        they haven't lost any advantage overtime.
      </p>

      <h2>Changes in Variation</h2>
      <div className="history-img-block">
        <img src="/OldDogs.jpg" alt="Three Black and White Dachshunds" className="history-img" />
        <blockquote>Source: Hampdach Dachshunds, 2021</blockquote>
      </div>
      <p>
        It is believed that the smooth coat Dachshund was the original Dachshund variation.
        This makes sense as they are usually seen as the most aggressive and least obedient
        variation. Kaiser Wilhelm II owned two Dachshunds named Wadl and Hexl, and both were
        described as biting and snarling little brutes. The longhaired variation resulted from
        selective breeding of smooth coat Dachshunds with varying coat lengths. And the
        wirehaired variation of Dachshunds are believed to be associated with the Terrier
        breed. This is a plausible theory as wirehaired Dachshunds are seen as the most
        obedient variation.
      </p>
      <blockquote>Source: Denise Flaim, American Kennel Club, Dec 2020</blockquote>
      <div className="clearfix"></div>
    </main>
  )
}