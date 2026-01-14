const FrontendBaseController = require('./FrontendBaseController');

class CommonController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        this.setup(req);
        return super.index(req, res);
    }
}
module.exports = CommonController;
