const FrontendBaseController = require('./FrontendBaseController');

class RegisterController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        this.setup(req);
        // todo: handle post for registration
        return super.index(req, res);
    }
}
module.exports = RegisterController;
