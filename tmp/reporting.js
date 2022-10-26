
/// เรียกข้อมูลทั้งหมด
// for (let i = 0; i < find_item.length; i++) {
//     let ob = {};
//     let filter_income = find_income.filter(val => {
//         return val.itemId == find_item[i].id
//     })

//     let total_price = 0;
//     for (let income of filter_income) {
//         total_price += income.total_price;
//     }

//     ob['name'] = find_item[i].name;
//     ob['total_price'] = total_price;
//     arr.push(ob);
// }


db.getCollection('cannabis_income').aggregate(
       [
              {
                     $project:
                     {
                            doc: "$$ROOT",
                            year: { $year: "$buy_date" },
                            month: { $month: "$buy_date" },
                            day: { $dayOfMonth: "$buy_date" }
                     }
              },
              { $match: { "month": 10, "year": 2022 } },
              {
                     $replaceRoot: {
                            newRoot: "$doc"
                     }
              }
       ]
)