const FrontendBaseController = require('./FrontendBaseController');

class FrontendController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        return super.index(req, res);
    }
}

module.exports = FrontendController;
