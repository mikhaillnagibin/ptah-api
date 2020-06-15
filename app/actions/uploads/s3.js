const fs = require('fs');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const aws = require('aws-sdk');
const urlJoin = require('url-join');

const config = require('../../../config/config');

const {AUTHENTICATION_ERROR, BAD_REQUEST, FILE_TYPE_DISALLOWED, FILE_SIZE_LIMIT_EXCEEDED} = require('../../../config/errors');

const allowedTypes = [
    {
        type: 'image/jpeg',
        extention: 'jpg',
    },
    {
        type: 'image/png',
        extention: 'png',
    },
];
const maxFileSizeInMb = 30;
const maxFileSize = maxFileSizeInMb * 1024 * 1024;

module.exports = async (ctx, next) => {
    try {
        const user = ctx.user.User;
        if (!user) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        const file = ctx.request.files.file;
        if (!file) {
            return ctx.throw(400, BAD_REQUEST);
        }

        const fileType = _.find(allowedTypes, {type: file.type});
        if (!fileType) {
            return ctx.throw(400, FILE_TYPE_DISALLOWED);

        }
        if (file.size > maxFileSize) {
            return ctx.throw(400, FILE_SIZE_LIMIT_EXCEEDED);
        }

        const result = await uploadFile(file, fileType, user.GetId(), config);

        ctx.status = 200;
        ctx.body = result;

    } catch (err) {
        throw err
    }
};

const uploadFile = function (file, fileType, userId, config) {
    aws.config.update({
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
        region: config.s3Region,
    });

    const s3 = new aws.S3({
        apiVersion: '2006-03-01',
    });

    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(file.path);
        stream.on('error', (err) => {
            reject(err);
        });

        const preKey = uuidv4();

        const filepath = urlJoin([config.cdnPath, userId, `${preKey}.${fileType.extention}`]);

        s3.upload(
            {
                Bucket: config.s3Bucket,
                Body: stream,
                Key: filepath,
                ContentType: file.type,
            },
            (err, data) => {
                if (err) {
                    reject(err);
                } else if (data) {
                    resolve({
                        file: {
                            name: data.Key,
                            nameWithoutExtention: preKey,
                            extention: fileType.extention,
                        },
                        url: data.Location,
                        cdnUrl: urlJoin([config.cdnHost, filepath]),
                    });
                }
            },
        );
    });
}

