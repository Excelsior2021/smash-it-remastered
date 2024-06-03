import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity"

const obscenity = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
})

export default obscenity
