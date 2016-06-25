library(jsonlite)
library(forecast)

crimes <- fromJSON(txt = 'data/crimes.json')

for (type in 1:16) {
  for (code in 1:length(crimes[[type]])) {
    myts = ts(crimes[[type]][[code]], start = c(2010, 12), end = c(2016, 2), frequency = 12)
    fit <- stl(myts, s.window = 4)
    res <- forecast(fit, h = 12)
    res <- ceiling(res[[2]])
    write(res, file="data/test", append=TRUE)
  }
}
plot(res)

j <- toJSON(round(res[[2]]))

write.csv(j, file = 'data/out')
c