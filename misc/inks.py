class Cartridge:
    def __init__(self, ml, color, pageYield, squareInches):
        self.color = color
        self.pageYield = pageYield
        self.squareInchesPerMl = squareInches * pageYield / ml
        self.mlPerLargePoster = 24 * 36 / self.squareInchesPerMl

    def __str__(self):
        return f'{self.color} - {self.costPerPoster(105, 160)} - {self.pageYield} - {self.mlPerLargePoster} - {self.squareInchesPerMl}'

    def getPosterYield(self, ml):
        posterYield = ml / self.mlPerLargePoster
        return posterYield

    def costPerPoster(self, cartridgeCost, ml):
        posterYield = ml / self.mlPerLargePoster
        return cartridgeCost / posterYield


# page yields from pro-300
# https://downloads.canon.com/nw/printer/misc-pages/print-speed-methodology/pdfs/PRO-300_Page-Yield.pdf
pro300Inks = [] 
pro300Inks.append(Cartridge(14.4,"MBK",270, 11*14))
pro300Inks.append(Cartridge(14.4,"PBK",33, 11*14))
pro300Inks.append(Cartridge(14.4,"GY",44, 11*14))
pro300Inks.append(Cartridge(14.4,"C",82, 11*14))
pro300Inks.append(Cartridge(14.4,"PC",116, 11*14))
pro300Inks.append(Cartridge(14.4,"M",87, 11*14))
pro300Inks.append(Cartridge(14.4,"PM",73, 11*14))
pro300Inks.append(Cartridge(14.4,"Y",87, 11*14))
pro300Inks.append(Cartridge(14.4,"R",129, 11*14))
pro300Inks.append(Cartridge(14.4,"CO",48, 11*14))
pro300Inks = sorted(pro300Inks, key=lambda x: str(x))

# page yields from pro-1000
# https://downloads.canon.com/nw/printer/misc-pages/print-speed-methodology/pdfs/PRO-1000-Page-Yield.pdf
pro1000Inks = [] 
pro1000Inks.append(Cartridge(80,"MBK",1715, 17*22))
pro1000Inks.append(Cartridge(80,"PBK",262, 17*22))
pro1000Inks.append(Cartridge(80,"GY",90, 17*22))
pro1000Inks.append(Cartridge(80,"PG",91, 17*22))
pro1000Inks.append(Cartridge(80,"PC",535, 17*22))
pro1000Inks.append(Cartridge(80,"C",1390, 17*22))
pro1000Inks.append(Cartridge(80,"PM",392, 17*22))
pro1000Inks.append(Cartridge(80,"M",2455, 17*22))
pro1000Inks.append(Cartridge(80,"Y",1485, 17*22))
pro1000Inks.append(Cartridge(80,"R",1595, 17*22))
pro1000Inks.append(Cartridge(80,"B",3110, 17*22))
pro1000Inks.append(Cartridge(80,"CO",530, 17*22))
pro1000Inks = sorted(pro1000Inks, key=lambda x: str(x))

def show(cartridges):
    for c in cartridges:
        print(c)

show(pro300Inks)
print()
show(pro1000Inks)

# costs per 24"x36" poster
cost = 105
ml = 160
pro300CostPerPoster = sum([c.costPerPoster(cost, ml) for c in pro300Inks])
pro1000CostPerPoster = sum([c.costPerPoster(cost, ml) for c in pro1000Inks])
pro1000Yield = sum([c.getPosterYield(ml) for c in pro1000Inks]) / len(pro1000Inks)
print(f'average poster yield {pro1000Yield}')

# cost = 105
# ml = 160
# pro300 7.572174721481199  pro1000 4.312309449486595

# cost = 187
# ml = 330
# pro300 6.53851277537424  pro1000 3.7236449849535034

# cost = 317
# ml = 700
# pro300 5.225315671748657  pro1000 2.9757868745300686


print(f'pro300 {pro300CostPerPoster}  pro1000 {pro1000CostPerPoster}')


pro300Inks4x6 = []
pro300Inks4x6.append(Cartridge(14.4,"MBK", 1750, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"PBK", 303, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"GY", 236, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"C", 735, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"PC", 625, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"M", 785, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"PM", 530, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"Y", 530, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"R", 920, 4*6))
pro300Inks4x6.append(Cartridge(14.4,"CO", 272, 4*6))
pro300CostPerPoster2 = sum([c.costPerPoster(cost, ml) for c in pro300Inks4x6])
print(f'pro300 {pro300CostPerPoster2}  pro1000 {pro1000CostPerPoster}')

# pro-200 page yields
# https://downloads.canon.com/nw/printer/misc-pages/print-speed-methodology/pdfs/PRO-200_PageYield.pdf
pro200Inks = []
pro200Inks.append(Cartridge(12.6, "BK", 69, 11*14))
pro200Inks.append(Cartridge(12.6, "GY", 96, 11*14))
pro200Inks.append(Cartridge(12.6, "LGY", 139, 11*14))
pro200Inks.append(Cartridge(12.6, "C", 51, 11*14))
pro200Inks.append(Cartridge(12.6, "PC", 59, 11*14))
pro200Inks.append(Cartridge(12.6, "M", 77, 11*14))
pro200Inks.append(Cartridge(12.6, "PM", 54, 11*14))
pro200Inks.append(Cartridge(12.6, "Y", 55, 11*14))
pro200CostPerPoster = sum([c.costPerPoster(cost, ml) for c in pro200Inks])
print(f'pro300 {pro200CostPerPoster}  pro1000 {pro1000CostPerPoster}')
