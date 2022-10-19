exports.addItem = async (req, res) => {
    try {
        const { image, type, name, rarity,
            price, use_type, quantity, phase_use,
            description, attribute } = req.body;
        let img_filename = "";
        let idImage = await getNextSequence();
        if (req.file) {
            const { filename } = req.file;
            let typeFile = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
            img_filename = `${idImage}_${makeNameImage(5)}.${typeFile}`;
            await checkDir();
            // await sharp(req.file.path)
            //     .resize(500, 500)
            //     .png({ quality: 90 })
            //     .toFile(
            //         path.resolve(req.file.destination, '../img-items', filename)
            //     )
            const move = path.resolve(__dirname, config.pathImg.pathItem);
            fs.renameSync(`${req.file.destination}/${filename}`, `${move}/${img_filename}`);
        }
        let originalPath = img_filename == (undefined || null || "") ? null : path.resolve(req.file.destination, '../img-items', img_filename)
        var itemModel = new items();
        itemModel.id = idImage;
        itemModel.image = img_filename == (undefined || null || "") ? null : `${ip.address()}:3000/image/${img_filename}`;
        itemModel.type = type == undefined ? null : type;
        itemModel.name = name == undefined ? null : name;
        itemModel.rarity = rarity == undefined ? null : rarity;
        itemModel.price = price == undefined ? null : price;
        itemModel.use_type = use_type == undefined ? null : use_type;
        itemModel.quantity = quantity == undefined ? null : quantity;
        itemModel.phase_use = phase_use == undefined ? null : phase_use;
        itemModel.description = description == undefined ? null : description;
        itemModel.imageOriginalPath = originalPath;
        let _ob;
        if (typeof (attribute) === 'string' || attribute instanceof String) {
            _ob = JSON.parse(attribute);
        } else {
            _ob = attribute;
        }
        itemModel.attribute = _ob;
        const result = await itemModel.save();
        logger.info(`addItem success by username: ${req.id}`)
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "Add item successfully 😊 👌"
            });
    }
    catch (err) {
        logger.error(`addItem error: ${err}`);
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}


exports.editItem = async (req, res) => {
    try {
        const { id } = req.body;
        let img_filename = "";
        let dateUpdate = req.body;
        if (id == undefined || id == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: id: Path `id` is required.",
                    statusCode: "400",
                });
        }
        if (req.file) {
            const { filename } = req.file;
            let typeFile = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
            img_filename = `${dateUpdate.id}_${makeNameImage(5)}.${typeFile}`;
            await checkDir();
            // await sharp(req.file.path)
            //     .resize(500, 500)
            //     .png({ quality: 100 })
            //     .toFile(
            //         path.resolve(req.file.destination, '../img-items', img_filename)
            //     )
            // fs.unlinkSync(req.file.path)
            const move = path.resolve(__dirname, config.pathImg.pathItem);
            fs.renameSync(`${req.file.destination}/${filename}`, `${move}/${img_filename}`);
        }
        if (typeof dateUpdate != 'object') {
            dateUpdate = JSON.parse(dateUpdate);
        }

        let find = await items.findOne({ id: id }).exec();
        if (find) {
            dateUpdate['image'] = img_filename == (undefined || null || "") ? find.image : `${ip.address()}:3000/image/${img_filename}`;
            let originalPath = img_filename == (undefined || null || "") ? find.imageOriginalPath : path.resolve(req.file.destination, '../img-items', img_filename)
            dateUpdate['imageOriginalPath'] = originalPath
            if (img_filename != (undefined || null || "")) {
                if (fs.existsSync(find.imageOriginalPath)) {
                    fs.unlinkSync(find.imageOriginalPath)
                }
            }

            delete dateUpdate.id;
            items.updateOne(
                { "_id": ObjectId(find._id) },
                {
                    $set: dateUpdate
                },
                { upsert: 1 }
            ).exec();
            logger.info(`editItem success by username: ${req.id}`)
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Edit item successfully 😊 👌"
                });
        } else {
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get item Not Foud",
                    result: null
                });
        }
    }
    catch (err) {
        logger.error(`addItem error: ${err}`);
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}